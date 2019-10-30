import { Component, OnInit } from '@angular/core';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AuthenticationDetails } from 'app/model/master';
import { MWarehouse } from 'app/model/warehouse-master-model';
import { WarehouseMasterService } from 'app/services/warhouse-master-service';
@Component({
  selector: 'warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit {
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  AllWarehouses: MWarehouse[] = [];
  SelectedWarehouse: MWarehouse;
  searchText = '';
  selectWarehouseID = 0;
  WarehouseFormGroup: FormGroup;
  constructor(
    private _WarehouseMasterService: WarehouseMasterService, 
    private _router: Router, 
    public snackBar: MatSnackBar, 
    private _formBuilder: FormBuilder, 
    private dialog: MatDialog) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedWarehouse = new MWarehouse();
    this.WarehouseFormGroup = this._formBuilder.group({
      Description: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Warehouse') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllWarehouses();
    }
    else {
      this._router.navigate(['/auth/login']);
    }
  }
  ResetControl(): void {
    this.SelectedWarehouse = new MWarehouse();
    this.selectWarehouseID = 0;
    this.WarehouseFormGroup.reset();
    Object.keys(this.WarehouseFormGroup.controls).forEach(key => {
      this.WarehouseFormGroup.get(key).markAsUntouched();
    });
  }
  AddWarehouse(): void {
    this.ResetControl();
  }
  GetAllWarehouses(): void {
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.GetAllWarehouses().subscribe((data) => {
      if (data) {
        this.AllWarehouses = data as MWarehouse[];
        if (this.AllWarehouses.length && this.AllWarehouses.length > 0) {
          this.loadSelectedWarehouse(this.AllWarehouses[0]);
        }
        this.IsProgressBarVisibile = false;
      }
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
    });
  }
  loadSelectedWarehouse(warehouse: MWarehouse): void {
    this.SelectedWarehouse = warehouse;
    this.selectWarehouseID = warehouse.WarehouseID;
    this.WarehouseFormGroup.get('Description').patchValue(warehouse.Description);
  }
  SaveClicked(): void {
    if (this.WarehouseFormGroup.valid) {
      if (this.SelectedWarehouse.WarehouseID) {
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
    if (this.WarehouseFormGroup.valid) {
      if (this.SelectedWarehouse.WarehouseID) {
        const Actiontype = 'Delete';
        this.OpenConfirmationDialog(Actiontype);
      }
    }
    else {
      this.ShowValidationErrors();
    }
  }
  ShowValidationErrors(): void {
    Object.keys(this.WarehouseFormGroup.controls).forEach(key => {
      this.WarehouseFormGroup.get(key).markAsTouched();
      this.WarehouseFormGroup.get(key).markAsDirty();
    });
  }
  OpenConfirmationDialog(Actiontype: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: 'Warehouse'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (Actiontype === 'Create') {
          this.CreateWarehouse();
        }
        else if (Actiontype === 'Update') {
          this.UpdateWarehouse();
        }
        else if (Actiontype === 'Delete') {
          this.DeleteWarehouse();
        }
      }
    });
  }
  CreateWarehouse(): void {
    this.SelectedWarehouse.Description = this.WarehouseFormGroup.get('Description').value;
    this.SelectedWarehouse.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.CreateWarehouse(this.SelectedWarehouse).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Warehouse created successfully', SnackBarStatus.success);
      this.GetAllWarehouses();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
  UpdateWarehouse(): void {
    this.SelectedWarehouse.Description = this.WarehouseFormGroup.get('Description').value;
    this.SelectedWarehouse.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.UpdateWarehouse(this.SelectedWarehouse).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Warehouse updated successfully', SnackBarStatus.success);
      this.GetAllWarehouses();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
  DeleteWarehouse(): void {
    this.SelectedWarehouse.Description = this.WarehouseFormGroup.get('Description').value;
    this.SelectedWarehouse.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.DeleteWarehouse(this.SelectedWarehouse).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Warehouse deleted successfully', SnackBarStatus.success);
      this.ResetControl();
      this.GetAllWarehouses();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
}
