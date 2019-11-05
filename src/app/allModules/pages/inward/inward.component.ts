import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationDetails } from 'app/model/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatIconRegistry, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Guid } from 'guid-typescript';
import { GRNItem, GRNHead } from 'app/model/warehouse-transaction-model';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MasterService } from 'app/services/master.service';
import { DatePipe } from '@angular/common';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

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
  AllGRNHeads: GRNHead[] = [];
  SelectedGRNHead: GRNHead;
  GRNItemList: GRNItem[];
  GRNHeadCreationFormGroup: FormGroup;
  fileToUpload: File;
  FileData: any;
  // GRNHeadCreationFormGroup: FormGroup;
  GRNItemColumns: string[] = ['Article', 'Code', 'Description', 'Batch', 'Quantity', 'UOM', 'Action'];
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
    private _datePipe: DatePipe
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedGRNHead = new GRNHead();
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
      Date: ['', Validators.required],
      Time: ['', Validators.required],
      Mode: ['', Validators.required],
      Address: ['', Validators.required],
      BillDate: ['', Validators.required],
      BillNumber: ['', Validators.required],
      GRNItems: this.GRNItemFormArray
    });
    this.GetAllGRNHeads();
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
    this.SelectedGRNHead = new GRNHead();
    this.GRNItemList = [];
    this.fileToUpload = null;
    this.FileData = null;
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


  GetAllGRNHeads(): void {
    // this._GRNHeadService.GetAllGRNHeads().subscribe(
    //   (data) => {
    //     if (data) {
    //       this.AllGRNHeads = data as GRNHeads[];
    //     }
    //   },
    //   (err) => {
    //     console.error(err);
    //   }
    // );
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
      Article: ['', Validators.required],
      Code: ['', Validators.required],
      Description: ['', Validators.required],
      Batch: ['', Validators.required],
      Quantity: ['', Validators.required],
      UOM: ['', Validators.required],
    });
    // this.GRNItemFormArray.push(row);
    // this.GRNItemFormArray.controls.unshift(row);
    this.GRNItemFormArray.insert(0, row);
    this.GRNItemDataSource.next(this.GRNItemFormArray.controls);
  }

  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      const file = new Blob([this.fileToUpload], { type: this.fileToUpload.type });
      const fileURL = URL.createObjectURL(file);
      this.FileData = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    }
  }

  DataTypeChange(event, index: number): void {
    const GRNItemsArry = this.GRNHeadCreationFormGroup.get('GRNItems') as FormArray;
    if (GRNItemsArry.length > 0) {
      GRNItemsArry.controls[index].get('DefaultValue').patchValue('');
      // if (event && event.value) {
      //   if (event.value.toString().toLowerCase().includes('date')) {
      //     GRNItemsArry.controls[index].get('DefaultValue').disable();
      //   } else {
      //     GRNItemsArry.controls[index].get('DefaultValue').enable();
      //   }
      // }
    }
  }

  SubmitClicked(): void {
    if (this.GRNHeadCreationFormGroup.valid) {
      if (!this.fileToUpload) {
        this.notificationSnackBarComponent.openSnackBar('Please select a file', SnackBarStatus.danger);
      }
      else {
        const GRNItemsArry = this.GRNHeadCreationFormGroup.get('GRNItems') as FormArray;
        if (GRNItemsArry.length <= 0) {
          this.notificationSnackBarComponent.openSnackBar('Please add parameter mapping', SnackBarStatus.danger);
        } else {
          const Actiontype = 'Create';
          const Catagory = 'GRNHead';
          this.OpenConfirmationDialog(Actiontype, Catagory);
        }
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
            this.CreateGRNHead();
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

  CreateGRNHead(): void {
    this.GetHeaderValues();
    this.IsProgressBarVisibile = true;
    // this._GRNHeadService.CreateGRNHead(this.SelectedGRNHead, this.fileToUpload).subscribe(
    //   (data) => {
    //     if (data) {
    //       this.SelectedGRNHead.GRNHeadID = data as number;
    //       this.CreateGRNItem();
    //     } else {
    //       this.notificationSnackBarComponent.openSnackBar('Something went wrong', SnackBarStatus.danger);
    //     }
    //     this.IsProgressBarVisibile = false;
    //   },
    //   (err) => {
    //     console.error(err);
    //     this.IsProgressBarVisibile = false;
    //     this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    //   }
    // );
  }

  CreateGRNItem(): void {
    this.GetParameterValues();
    this.IsProgressBarVisibile = true;
    // this._GRNHeadService.CreateGRNItem(this.GRNItemList).subscribe(
    //   (data) => {
    //     this.notificationSnackBarComponent.openSnackBar('GRNHead details updated successfully', SnackBarStatus.success);
    //     this.IsProgressBarVisibile = false;
    //     this.ResetControl();
    //   },
    //   (err) => {
    //     console.error(err);
    //     this.IsProgressBarVisibile = false;
    //     this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    //   }
    // );
  }

  GetHeaderValues(): void {
    this.SelectedGRNHead = new GRNHead();
    // this.SelectedGRNHead.GRNHeadType = this.GRNHeadCreationFormGroup.get('GRNHeadType').value;
    // this.SelectedGRNHead.Description = this.GRNHeadCreationFormGroup.get('Description').value;
    // this.SelectedGRNHead.Entity = this.GRNHeadCreationFormGroup.get('Entity').value;
    // this.SelectedGRNHead.Group = this.GRNHeadCreationFormGroup.get('Group').value;
    // this.SelectedGRNHead.CreatedBy = this.CurrentUserID.toString();
  }

  GetParameterValues(): void {
    this.GRNItemList = [];
    const HeaderApproversArr = this.GRNHeadCreationFormGroup.get('GRNItems') as FormArray;
    HeaderApproversArr.controls.forEach((x, i) => {
      const headApp: GRNItem = new GRNItem();
      // headApp.GRNHeadID = this.SelectedGRNHead.GRNHeadID;
      // headApp.Variable = x.get('Variable').value;
      // headApp.DataType = x.get('DataType').value;
      // const deV = x.get('DefaultValue').value;
      // if (deV && headApp.DataType.toLocaleLowerCase().includes('date')) {
      //   headApp.DefaultValue = this._datePipe.transform(deV, 'MM-dd-yyyy');
      // } else {
      //   headApp.DefaultValue = deV;
      // }
      // headApp.Description = x.get('Description').value;
      // headApp.CreatedBy = this.CurrentUserID.toString();
      // this.GRNItemList.push(headApp);
    });
  }


}
