import { Component, OnInit } from '@angular/core';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AuthenticationDetails } from 'app/model/master';
import { WarehouseMasterService } from 'app/services/warhouse-master-service';
import { MWarehouseBin } from 'app/model/warehouse-master-model';
@Component({
  selector: 'warehouse-bin',
  templateUrl: './warehouse-bin.component.html',
  styleUrls: ['./warehouse-bin.component.scss']
})
export class WarehouseBinComponent implements OnInit {
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  AllWarehouseBins: MWarehouseBin[] = [];
  SelectedWarehouseBin: MWarehouseBin;
  searchText = '';
  selectWarehouseBinID = 0;
  WarehouseBinFormGroup: FormGroup;
  constructor(
    private _WarehouseMasterService: WarehouseMasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedWarehouseBin = new MWarehouseBin();
    this.WarehouseBinFormGroup = this._formBuilder.group({
      WarehouseID: ['', Validators.required],
      Area: ['', Validators.required],
      Section: ['', Validators.required],
      Bin: ['', Validators.required],
      Volume: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$')]],
      Weight: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$')]],
      CapacityUtilized: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$')]]
    });
  }
  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('WarehouseBin') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllWarehouseBins();
    }
    else {
      this._router.navigate(['/auth/login']);
    }
  }
  ResetControl(): void {
    this.SelectedWarehouseBin = new MWarehouseBin();
    this.selectWarehouseBinID = 0;
    this.WarehouseBinFormGroup.reset();
    Object.keys(this.WarehouseBinFormGroup.controls).forEach(key => {
      this.WarehouseBinFormGroup.get(key).markAsUntouched();
    });
  }
  AddWarehouseBin(): void {
    this.ResetControl();
  }
  GetAllWarehouseBins(): void {
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.GetAllWarehouseBins().subscribe((data) => {
      if (data) {
        this.AllWarehouseBins = data as MWarehouseBin[];
        if (this.AllWarehouseBins.length && this.AllWarehouseBins.length > 0) {
          this.loadSelectedWarehouseBin(this.AllWarehouseBins[0]);
        }
        this.IsProgressBarVisibile = false;
      }
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
    });
  }
  loadSelectedWarehouseBin(WarehouseBin: MWarehouseBin): void {
    this.SelectedWarehouseBin = WarehouseBin;
    this.selectWarehouseBinID = WarehouseBin.WarehouseID;
    this.InsertWarhouseBinDeatils();
  }

  InsertWarhouseBinDeatils(): void {
    this.WarehouseBinFormGroup.get('WarehouseID').patchValue(this.SelectedWarehouseBin.WarehouseID);
    this.WarehouseBinFormGroup.get('Area').patchValue(this.SelectedWarehouseBin.Area);
    this.WarehouseBinFormGroup.get('Section').patchValue(this.SelectedWarehouseBin.Section);
    this.WarehouseBinFormGroup.get('Bin').patchValue(this.SelectedWarehouseBin.Bin);
    this.WarehouseBinFormGroup.get('Volume').patchValue(this.SelectedWarehouseBin.Volume);
    this.WarehouseBinFormGroup.get('Weight').patchValue(this.SelectedWarehouseBin.Weight);
    this.WarehouseBinFormGroup.get('CapacityUtilized').patchValue(this.SelectedWarehouseBin.CapacityUtilized);
  }

  SaveClicked(): void {
    if (this.WarehouseBinFormGroup.valid) {
      if (this.SelectedWarehouseBin.WarehouseID) {
        const Actiontype = 'Update';
        this.OpenConfirmationDialog(Actiontype);
      }
      else {
        const Actiontype = 'Create';
        this.OpenConfirmationDialog(Actiontype);
      }
    }
    else {
      this.ShowValidationErrors();
    }
  }
  DeleteClicked(): void {
    if (this.WarehouseBinFormGroup.valid) {
      if (this.SelectedWarehouseBin.WarehouseID) {
        const Actiontype = 'Delete';
        this.OpenConfirmationDialog(Actiontype);
      }
    }
    else {
      this.ShowValidationErrors();
    }
  }
  ShowValidationErrors(): void {
    Object.keys(this.WarehouseBinFormGroup.controls).forEach(key => {
      this.WarehouseBinFormGroup.get(key).markAsTouched();
      this.WarehouseBinFormGroup.get(key).markAsDirty();
    });
  }
  OpenConfirmationDialog(Actiontype: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: 'WarehouseBin'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (Actiontype === 'Create') {
          this.CreateWarehouseBin();
        }
        else if (Actiontype === 'Update') {
          this.UpdateWarehouseBin();
        }
        else if (Actiontype === 'Delete') {
          this.DeleteWarehouseBin();
        }
      }
    });
  }
  CreateWarehouseBin(): void {
    this.GetWarehouseBinDeatails();
    this.SelectedWarehouseBin.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.CreateWarehouseBin(this.SelectedWarehouseBin).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Warehouse bin created successfully', SnackBarStatus.success);
      this.GetAllWarehouseBins();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
  UpdateWarehouseBin(): void {
    this.GetWarehouseBinDeatails();
    this.SelectedWarehouseBin.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.UpdateWarehouseBin(this.SelectedWarehouseBin).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Warehouse bin updated successfully', SnackBarStatus.success);
      this.GetAllWarehouseBins();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
  DeleteWarehouseBin(): void {
    this.GetWarehouseBinDeatails();
    this.SelectedWarehouseBin.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.DeleteWarehouseBin(this.SelectedWarehouseBin).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Warehouse bin deleted successfully', SnackBarStatus.success);
      this.ResetControl();
      this.GetAllWarehouseBins();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }

  GetWarehouseBinDeatails(): void {
    this.SelectedWarehouseBin.WarehouseID = this.WarehouseBinFormGroup.get('WarehouseID').value;
    this.SelectedWarehouseBin.Area = this.WarehouseBinFormGroup.get('Area').value;
    this.SelectedWarehouseBin.Section = this.WarehouseBinFormGroup.get('Section').value;
    this.SelectedWarehouseBin.Bin = this.WarehouseBinFormGroup.get('Bin').value;
    this.SelectedWarehouseBin.Volume = this.WarehouseBinFormGroup.get('Volume').value;
    this.SelectedWarehouseBin.Weight = this.WarehouseBinFormGroup.get('Weight').value;
    this.SelectedWarehouseBin.CapacityUtilized = this.WarehouseBinFormGroup.get('CapacityUtilized').value;
  }
}
