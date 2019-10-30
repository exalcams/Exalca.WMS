import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    // tslint:disable-next-line:max-line-length
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatListModule, MatMenuModule, MatRadioModule, MatSidenavModule, MatToolbarModule, 
    MatSpinner, MatProgressSpinner, MatProgressSpinnerModule, MatTooltip, MatTooltipModule
} from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule } from '@fuse/components';
import { FileUploadModule } from 'ng2-file-upload';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { WarehouseBinComponent } from './warehouse-bin/warehouse-bin.component';

const menuRoutes: Routes = [
    {
        path: 'warehouse',
        component: WarehouseComponent,
    },
    {
        path: 'warehouseBin',
        component: WarehouseBinComponent,
    },
    {
        path: 'user',
        // component: UserComponent,
    },
];
@NgModule({
    declarations: [
        WarehouseComponent,
        WarehouseBinComponent
    ],
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatSidenavModule,
        MatToolbarModule,
        MatTooltipModule,
        FuseSharedModule,
        FileUploadModule,
        RouterModule.forChild(menuRoutes)
    ],
    providers: [

    ]
})
export class WarehouseMasterModule {
}

