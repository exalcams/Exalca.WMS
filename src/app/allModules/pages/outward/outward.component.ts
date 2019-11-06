import { Component, OnInit } from '@angular/core';
import { AuthenticationDetails } from 'app/model/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MArticle, MUOM } from 'app/model/warehouse-master-model';
import { OutboundWithItemView, OutboundItem, OutboundItemView } from 'app/model/warehouse-transaction-model';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MatIconRegistry, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MasterService } from 'app/services/master.service';
import { DatePipe } from '@angular/common';
import { WarehouseTransactionService } from 'app/services/warhouse-transaction-service';
import { WarehouseMasterService } from 'app/services/warhouse-master-service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

@Component({
  selector: 'app-outward',
  templateUrl: './outward.component.html',
  styleUrls: ['./outward.component.scss']
})
export class OutwardComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  MenuItems: string[];
  CurrentUserName: string;
  CurrentUserID: Guid;
  CurrentUserRole = '';
  CurrentDate: Date;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  AllArticles: MArticle[] = [];
  AllUOMs: MUOM[] = [];
  AllGRNItemBatches: string[] = [];
  SelectedOutbound: OutboundWithItemView;
  OutboundHeadCreationFormGroup: FormGroup;
  // OutboundHeadCreationFormGroup: FormGroup;
  OutboundItemColumns: string[] = ['Code', 'Description', 'Batch', 'Quantity', 'UOM', 'Action'];
  OutboundItemFormArray: FormArray = this._formBuilder.array([]);
  OutboundItemDataSource = new BehaviorSubject<AbstractControl[]>([]);

  constructor(
    private _router: Router,
    matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _masterService: MasterService,
    private dialog: MatDialog,
    private _datePipe: DatePipe,
    private _warehouseTransactionService: WarehouseTransactionService,
    private _warehouseMasterService: WarehouseMasterService,
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedOutbound = new OutboundWithItemView();
    this.SelectedOutbound.OutboundItems = [];
  }

  ngOnInit(): void {
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserName = this.authenticationDetails.userName;
      this.CurrentUserID = this.authenticationDetails.userID;
      this.CurrentUserRole = this.authenticationDetails.userRole;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Inward') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.OutboundHeadCreationFormGroup = this._formBuilder.group({
      Customer: ['', Validators.required],
      TransferID: ['', Validators.required],
      Date: ['', Validators.required],
      OutboundItems: this.OutboundItemFormArray
    });
    this.GetAllArticles();
    this.GetAllUOMs();
    this.GetAllGRNItemBatches();
  }

  ResetForm(): void {
    this.OutboundHeadCreationFormGroup.reset();
    Object.keys(this.OutboundHeadCreationFormGroup.controls).forEach(key => {
      this.OutboundHeadCreationFormGroup.get(key).markAsUntouched();
    });
  }
  ResetControl(): void {
    this.ResetOutboundItems();
    this.ResetForm();
    this.SelectedOutbound = new OutboundWithItemView();
    this.SelectedOutbound.OutboundItems = [];
  }

  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  ResetOutboundItems(): void {
    this.ClearFormArray(this.OutboundItemFormArray);
    this.OutboundItemDataSource.next(this.OutboundItemFormArray.controls);
  }

  GetAllArticles(): void {
    this._warehouseMasterService.GetAllArticles().subscribe(
      (data) => {
        this.AllArticles = data as MArticle[];
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetAllUOMs(): void {
    this._warehouseMasterService.GetAllUOMs().subscribe(
      (data) => {
        this.AllUOMs = data as MUOM[];
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetAllGRNItemBatches(): void {
    this._warehouseMasterService.GetAllGRNItemBatches().subscribe(
      (data) => {
        this.AllGRNItemBatches = data as string[];
      },
      (err) => {
        console.error(err);
      }
    );
  }

  AddOutboundItem(): void {
    this.AddOutboundItemFormGroup();
  }

  RemoveOutboundItem(index: number): void {
    if (this.OutboundHeadCreationFormGroup.enabled) {
      if (this.OutboundItemFormArray.length > 0) {
        this.OutboundItemFormArray.removeAt(index);
        this.OutboundItemDataSource.next(this.OutboundItemFormArray.controls);
      } else {
        this.notificationSnackBarComponent.openSnackBar('no items to delete', SnackBarStatus.warning);
      }
    }
  }

  AddOutboundItemFormGroup(): void {
    const row = this._formBuilder.group({
      Code: ['', Validators.required],
      Description: ['', Validators.required],
      Batch: ['', Validators.required],
      // ManufacturedDate: ['', Validators.required],
      Quantity: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$')]],
      UOM: ['', Validators.required],
      // ExpiredDate: ['', Validators.required]
    });
    // this.OutboundItemFormArray.push(row);
    // this.OutboundItemFormArray.controls.unshift(row);
    this.OutboundItemFormArray.insert(0, row);
    this.OutboundItemDataSource.next(this.OutboundItemFormArray.controls);
  }

  SubmitClicked(): void {
    if (this.OutboundHeadCreationFormGroup.valid) {
      const OutboundItemsArry = this.OutboundHeadCreationFormGroup.get('OutboundItems') as FormArray;
      if (OutboundItemsArry.length <= 0) {
        this.notificationSnackBarComponent.openSnackBar('Please add Outbound Item', SnackBarStatus.danger);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Outbound';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors(this.OutboundHeadCreationFormGroup);
    }
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreateOutbound();
            // console.log('valid');
          }
          else if (Actiontype === 'Approve') {
            // this.ApproveHeader();
          }
        }
      });
  }
  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });
  }

  CreateOutbound(): void {
    this.GetOutboundHeaderValues();
    this.GetOutboundItemsValues();
    this.IsProgressBarVisibile = true;
    this._warehouseTransactionService.CreateOutbound(this.SelectedOutbound).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Outbound Created successfully', SnackBarStatus.success);
        this.ResetControl();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetOutboundHeaderValues(): void {
    this.SelectedOutbound = new OutboundWithItemView();
    this.SelectedOutbound.Customer = this.OutboundHeadCreationFormGroup.get('Customer').value;
    this.SelectedOutbound.TransferID = this.OutboundHeadCreationFormGroup.get('TransferID').value;
    this.SelectedOutbound.Date = this.OutboundHeadCreationFormGroup.get('Date').value;
    this.SelectedOutbound.CreatedBy = this.CurrentUserID.toString();
  }

  GetOutboundItemsValues(): void {
    this.SelectedOutbound.OutboundItems = [];
    const OutboundItemsArr = this.OutboundHeadCreationFormGroup.get('OutboundItems') as FormArray;
    OutboundItemsArr.controls.forEach((x, i) => {
      const item: OutboundItemView = new OutboundItemView();
      item.Code = x.get('Code').value;
      item.Description = x.get('Description').value;
      item.Batch = x.get('Batch').value;
      // item.ManufacturedDate = x.get('ManufacturedDate').value;
      item.Quantity = x.get('Quantity').value;
      item.UOM = x.get('UOM').value;
      // item.ExpiredDate = x.get('ExpiredDate').value;
      this.SelectedOutbound.OutboundItems.push(item);
    });
  }
}
