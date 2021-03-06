import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationDetails } from 'app/model/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatIconRegistry, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Guid } from 'guid-typescript';
import { GRNItem, GRNHead, GRNWithItemView, GRNItemView } from 'app/model/warehouse-transaction-model';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MasterService } from 'app/services/master.service';
import { DatePipe } from '@angular/common';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { WarehouseTransactionService } from 'app/services/warhouse-transaction-service';
import { WarehouseMasterService } from 'app/services/warhouse-master-service';
import { MUOM, MArticle } from 'app/model/warehouse-master-model';

@Component({
  selector: 'app-inward',
  templateUrl: './inward.component.html',
  styleUrls: ['./inward.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class InwardComponent implements OnInit {
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
  SelectedGRN: GRNWithItemView;
  GRNHeadCreationFormGroup: FormGroup;
  // GRNHeadCreationFormGroup: FormGroup;
  GRNItemColumns: string[] = ['Code', 'Description', 'Batch', 'ManufacturedDate', 'Quantity', 'UOM', 'ExpiredDate', 'Action'];
  GRNItemFormArray: FormArray = this._formBuilder.array([]);
  GRNItemDataSource = new BehaviorSubject<AbstractControl[]>([]);

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
    this.SelectedGRN = new GRNWithItemView();
    this.SelectedGRN.GRNItems = [];
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
    this.GRNHeadCreationFormGroup = this._formBuilder.group({
      Vendor: ['', Validators.required],
      // GRNDate: ['', Validators.required],
      // GRNTime: ['', Validators.required],
      // Mode: ['', Validators.required],
      // Address: ['', Validators.required],
      TruckNumber: ['', Validators.required],
      ChallanDate: ['', Validators.required],
      ChallanNumber: ['', Validators.required],
      GRNItems: this.GRNItemFormArray
    });
    this.GetAllArticles();
    this.GetAllUOMs();
  }

  ResetForm(): void {
    this.GRNHeadCreationFormGroup.reset();
    Object.keys(this.GRNHeadCreationFormGroup.controls).forEach(key => {
      this.GRNHeadCreationFormGroup.get(key).markAsUntouched();
    });
  }
  ResetControl(): void {
    this.ResetGRNItems();
    this.ResetForm();
    this.SelectedGRN = new GRNWithItemView();
    this.SelectedGRN.GRNItems = [];
  }

  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  ResetGRNItems(): void {
    this.ClearFormArray(this.GRNItemFormArray);
    this.GRNItemDataSource.next(this.GRNItemFormArray.controls);
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

  AddGRNItem(): void {
    this.AddGRNItemFormGroup();
  }

  RemoveGRNItem(index: number): void {
    if (this.GRNHeadCreationFormGroup.enabled) {
      if (this.GRNItemFormArray.length > 0) {
        this.GRNItemFormArray.removeAt(index);
        this.GRNItemDataSource.next(this.GRNItemFormArray.controls);
      } else {
        this.notificationSnackBarComponent.openSnackBar('no items to delete', SnackBarStatus.warning);
      }
    }
  }

  AddGRNItemFormGroup(): void {
    const row = this._formBuilder.group({
      Code: ['', Validators.required],
      Description: ['', Validators.required],
      Batch: ['', Validators.required],
      ManufacturedDate: ['', Validators.required],
      Quantity: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$')]],
      UOM: ['', Validators.required],
      ExpiredDate: ['', Validators.required]
    });
    // this.GRNItemFormArray.push(row);
    // this.GRNItemFormArray.controls.unshift(row);
    this.GRNItemFormArray.insert(0, row);
    this.GRNItemDataSource.next(this.GRNItemFormArray.controls);
  }

  SubmitClicked(): void {
    if (this.GRNHeadCreationFormGroup.valid) {
      const GRNItemsArry = this.GRNHeadCreationFormGroup.get('GRNItems') as FormArray;
      if (GRNItemsArry.length <= 0) {
        this.notificationSnackBarComponent.openSnackBar('Please add GRN Item', SnackBarStatus.danger);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'GRN';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors(this.GRNHeadCreationFormGroup);
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
            this.CreateGRN();
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

  CreateGRN(): void {
    this.GetGRNHeaderValues();
    this.GetGRNItemsValues();
    this.IsProgressBarVisibile = true;
    this._warehouseTransactionService.CreateGRN(this.SelectedGRN).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('GRN Created successfully', SnackBarStatus.success);
        this.ResetControl();
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetGRNHeaderValues(): void {
    this.SelectedGRN = new GRNWithItemView();
    this.SelectedGRN.Vendor = this.GRNHeadCreationFormGroup.get('Vendor').value;
    this.SelectedGRN.TruckNumber = this.GRNHeadCreationFormGroup.get('TruckNumber').value;
    this.SelectedGRN.ChallanDate = this.GRNHeadCreationFormGroup.get('ChallanDate').value;
    this.SelectedGRN.ChallanNumber = this.GRNHeadCreationFormGroup.get('ChallanNumber').value;
    // this.SelectedGRN.GRNDate = this.GRNHeadCreationFormGroup.get('GRNDate').value;
    // this.SelectedGRN.GRNTime = this.GRNHeadCreationFormGroup.get('GRNTime').value;
    // this.SelectedGRN.Mode = this.GRNHeadCreationFormGroup.get('Mode').value;
    this.SelectedGRN.CreatedBy = this.CurrentUserID.toString();
  }

  GetGRNItemsValues(): void {
    this.SelectedGRN.GRNItems = [];
    const GRNItemsArr = this.GRNHeadCreationFormGroup.get('GRNItems') as FormArray;
    GRNItemsArr.controls.forEach((x, i) => {
      const item: GRNItemView = new GRNItemView();
      item.Code = x.get('Code').value;
      item.Description = x.get('Description').value;
      item.Batch = x.get('Batch').value;
      item.ManufacturedDate = x.get('ManufacturedDate').value;
      item.Quantity = x.get('Quantity').value;
      item.UOM = x.get('UOM').value;
      item.ExpiredDate = x.get('ExpiredDate').value;
      this.SelectedGRN.GRNItems.push(item);
    });
  }


}
