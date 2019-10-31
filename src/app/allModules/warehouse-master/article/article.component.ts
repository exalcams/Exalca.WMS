import { Component, OnInit } from '@angular/core';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AuthenticationDetails } from 'app/model/master';
import { MArticle } from 'app/model/warehouse-master-model';
import { WarehouseMasterService } from 'app/services/warhouse-master-service';
@Component({
  selector: 'Article',
  templateUrl: './Article.component.html',
  styleUrls: ['./Article.component.scss']
})
export class ArticleComponent implements OnInit {
  MenuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  AllArticles: MArticle[] = [];
  SelectedArticle: MArticle;
  searchText = '';
  selectCode = 0;
  ArticleFormGroup: FormGroup;
  constructor(
    private _WarehouseMasterService: WarehouseMasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedArticle = new MArticle();
    this.ArticleFormGroup = this._formBuilder.group({
      Description: ['', Validators.required],
      NetWeight: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$')]],
      Volume: ['', [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$')]],
      UOM: ['', Validators.required],
      SelfLifeDays: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      WarehouseID: ['', Validators.required],
      Area: ['', Validators.required],
      Section: ['', Validators.required],
      Bin: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
      if (this.MenuItems.indexOf('Article') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.GetAllArticles();
    }
    else {
      this._router.navigate(['/auth/login']);
    }
  }
  ResetControl(): void {
    this.SelectedArticle = new MArticle();
    this.selectCode = 0;
    this.ArticleFormGroup.reset();
    Object.keys(this.ArticleFormGroup.controls).forEach(key => {
      this.ArticleFormGroup.get(key).markAsUntouched();
    });
  }
  AddArticle(): void {
    this.ResetControl();
  }
  GetAllArticles(): void {
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.GetAllArticles().subscribe((data) => {
      if (data) {
        this.AllArticles = data as MArticle[];
        if (this.AllArticles.length && this.AllArticles.length > 0) {
          this.loadSelectedArticle(this.AllArticles[0]);
        }
        this.IsProgressBarVisibile = false;
      }
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
    });
  }
  loadSelectedArticle(Article: MArticle): void {
    this.SelectedArticle = Article;
    this.selectCode = Article.Code;
    this.InsertArticleDetails();
  }
  InsertArticleDetails(): void {
    this.ArticleFormGroup.get('Description').patchValue(this.SelectedArticle.Description);
    this.ArticleFormGroup.get('NetWeight').patchValue(this.SelectedArticle.NetWeight);
    this.ArticleFormGroup.get('Volume').patchValue(this.SelectedArticle.Volume);
    this.ArticleFormGroup.get('UOM').patchValue(this.SelectedArticle.UOM);
    this.ArticleFormGroup.get('SelfLifeDays').patchValue(this.SelectedArticle.SelfLifeDays);
    this.ArticleFormGroup.get('WarehouseID').patchValue(this.SelectedArticle.WarehouseID);
    this.ArticleFormGroup.get('Area').patchValue(this.SelectedArticle.Area);
    this.ArticleFormGroup.get('Section').patchValue(this.SelectedArticle.Section);
    this.ArticleFormGroup.get('Bin').patchValue(this.SelectedArticle.Bin);
  }
  SaveClicked(): void {
    if (this.ArticleFormGroup.valid) {
      if (this.SelectedArticle.Code) {
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
    if (this.ArticleFormGroup.valid) {
      if (this.SelectedArticle.Code) {
        const Actiontype = 'Delete';
        this.OpenConfirmationDialog(Actiontype);
      }
    }
    else {
      this.ShowValidationErrors();
    }
  }
  ShowValidationErrors(): void {
    Object.keys(this.ArticleFormGroup.controls).forEach(key => {
      this.ArticleFormGroup.get(key).markAsTouched();
      this.ArticleFormGroup.get(key).markAsDirty();
    });
  }
  OpenConfirmationDialog(Actiontype: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: 'Article'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (Actiontype === 'Create') {
          this.CreateArticle();
        }
        else if (Actiontype === 'Update') {
          this.UpdateArticle();
        }
        else if (Actiontype === 'Delete') {
          this.DeleteArticle();
        }
      }
    });
  }
  CreateArticle(): void {
    this.GetArticleDetails();
    this.SelectedArticle.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.CreateArticle(this.SelectedArticle).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Article created successfully', SnackBarStatus.success);
      this.GetAllArticles();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
  UpdateArticle(): void {
    this.GetArticleDetails();
    this.SelectedArticle.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.UpdateArticle(this.SelectedArticle).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Article updated successfully', SnackBarStatus.success);
      this.GetAllArticles();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
  DeleteArticle(): void {
    this.GetArticleDetails();
    this.SelectedArticle.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._WarehouseMasterService.DeleteArticle(this.SelectedArticle).subscribe((data) => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Article deleted successfully', SnackBarStatus.success);
      this.ResetControl();
      this.GetAllArticles();
    }, (err) => {
      console.error(err);
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
  GetArticleDetails(): void {
    this.SelectedArticle.Description = this.ArticleFormGroup.get('Description').value;
    this.SelectedArticle.NetWeight = this.ArticleFormGroup.get('NetWeight').value;
    this.SelectedArticle.Volume = this.ArticleFormGroup.get('Volume').value;
    this.SelectedArticle.UOM = this.ArticleFormGroup.get('UOM').value;
    this.SelectedArticle.SelfLifeDays = this.ArticleFormGroup.get('SelfLifeDays').value;
    this.SelectedArticle.WarehouseID = this.ArticleFormGroup.get('WarehouseID').value;
    this.SelectedArticle.Area = this.ArticleFormGroup.get('Area').value;
    this.SelectedArticle.Section = this.ArticleFormGroup.get('Section').value;
    this.SelectedArticle.Bin = this.ArticleFormGroup.get('Bin').value;
  }

}
