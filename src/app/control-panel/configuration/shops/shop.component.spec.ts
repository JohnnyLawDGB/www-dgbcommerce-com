import { ActivatedRoute, Router, RouterLink, convertToParamMap } from '@angular/router';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Constants } from 'src/app/shared/Constants';
import { ControlPanelConfigurationShopComponent } from './shop.component';
import { ControlPanelConfigurationShopListComponent } from './shop-list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MutationResult } from 'src/app/shared/models/MutationResult';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ShopService } from 'src/app/shared/services/Shop.service';
import { TestDataMerchants } from 'src/assets/test-data/Merchants';
import { TestDataShops } from 'src/assets/test-data/Shops';

describe('ControlPanelConfigurationShopComponent', () => {
  let component: ControlPanelConfigurationShopComponent;
  let fixture: ComponentFixture<ControlPanelConfigurationShopComponent>;

  let shopServiceSpy: jasmine.SpyObj<ShopService>;
  let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let mutationResult: MutationResult = <MutationResult>{ ErrorCode: 0, Identity: '', Message: '' };

  beforeEach(() => {
    shopServiceSpy = jasmine.createSpyObj('ShopService', ['create', 'getById', 'subdomainAvailable', 'update']);
    shopServiceSpy.create.and.returnValue(of(mutationResult));
    shopServiceSpy.getById.and.returnValue(of(TestDataShops[0]));
    shopServiceSpy.subdomainAvailable.and.returnValue(of(true));
    shopServiceSpy.update.and.returnValue(of(mutationResult));
    matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      declarations: [ControlPanelConfigurationShopComponent],
      imports: [BrowserAnimationsModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTooltipModule, ReactiveFormsModule, RouterLink, RouterTestingModule.withRoutes(
        [{ path: 'control-panel/configuration/shops', component: ControlPanelConfigurationShopListComponent }]
      )],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ shopId: TestDataShops[0].Id }) } } },
        { provide: ShopService, useValue: shopServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        ControlPanelConfigurationShopComponent,
        HttpClient,
        HttpHandler,
        Router
      ]
    });
    fixture = TestBed.createComponent(ControlPanelConfigurationShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set page title on data retrieval', () => {
    component.onRetrieveData(TestDataShops[0]);
    expect(component.pageTitle).toBe(TestDataShops[0].Name);
  });

  it('should not proceed submitting when required form values are not filled in', () => {
    component.controlName.setValue('');
    component.onSubmit();
    expect(component.formSubmitted).toBeTrue();
    expect(component.formLoading).toBeFalse();
  });

  it('should send a call to the shop service when creating a new shop', () => {
    component.activeMerchant = TestDataMerchants[0];
    component.queryStringShopId = '';
    component.controlName.setValue(TestDataShops[0].Name);
    component.controlSubDomain.setValue(TestDataShops[0].SubDomain!);
    component.onSubmit();
    expect(component.formLoading).toBeFalse();
  });

  it('should send a call to the shop service when updating an existing shop', () => {
    component.queryStringShopId = TestDataShops[0].Id;
    component.controlName.setValue(TestDataShops[0].Name);
    component.controlSubDomain.setValue(TestDataShops[0].SubDomain!);
    component.onSubmit();
    expect(component.formLoading).toBeFalse();
  });

  it('should redirect when handling submit result and no errors are applicable', () => {
    const routerstub: Router = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    const mutationResult = <MutationResult>{ Constraint: '', ErrorCode: 0, Identity: '', Message: '', Success: true };
    component.handleOnSubmitResult(mutationResult);
    expect(routerstub.navigate).toHaveBeenCalledWith(['/control-panel/configuration/shops']);
  });

  it('should show a message when an unhandled error occurs', () => {
    component.handleOnSubmitError('Unhandled error');
    expect(matSnackBarSpy.open).toHaveBeenCalled();
  });

  it('should show an error when handling submit result and an error code is applicable', () => {
    const mutationResult = <MutationResult>{ Constraint: '', ErrorCode: 666, Identity: '', Message: 'Evil error' };
    component.handleOnSubmitResult(mutationResult);
    expect(matSnackBarSpy.open).toHaveBeenCalled();
  });

  it('should show a specific error when handling submit result and an error code with constraint \'UNIQUE_Shop_SubDomain\' is applicable', () => {
    const mutationResult = <MutationResult>{ Constraint: 'UNIQUE_Shop_SubDomain', ErrorCode: 666, Identity: '', Message: 'Evil error' };
    component.handleOnSubmitResult(mutationResult);
    expect(matSnackBarSpy.open).toHaveBeenCalled();
  });

  it('should indicate subdomain is available when a valid subdomain was supplied', () => {
    component.checkSubDomainAvailability('untaken-subdomain');
    expect(component.subDomainAvailable).toBe(true);
  });

  it('should indicate subdomain is not available when a reserved subdomain was supplied', () => {
    component.checkSubDomainAvailability(Constants.RESERVED_SUBDOMAINS[0]);
    expect(component.subDomainAvailable).toBe(false);
  });

  it('should check subdomain availability when a value is entered', fakeAsync(() => {
    const componentStub: ControlPanelConfigurationShopComponent = TestBed.inject(ControlPanelConfigurationShopComponent);
    spyOn(componentStub, 'checkSubDomainAvailability');
    componentStub.controlSubDomain.setValue('test');
    tick(1000);
    expect(componentStub.checkSubDomainAvailability).toHaveBeenCalled();
  }));
});

describe('ControlPanelConfigurationShopComponentWithErrors', () => {
  let component: ControlPanelConfigurationShopComponent;
  let fixture: ComponentFixture<ControlPanelConfigurationShopComponent>;

  let shopServiceSpy: jasmine.SpyObj<ShopService>;
  let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    shopServiceSpy = jasmine.createSpyObj('ShopService', ['create', 'getById', 'subdomainAvailable', 'update']);
    shopServiceSpy.create.and.returnValue(throwError(() => new Error('ERROR')));
    shopServiceSpy.getById.and.returnValue(of(TestDataShops[0]));
    shopServiceSpy.subdomainAvailable.and.returnValue(throwError(() => new Error('ERROR')));
    shopServiceSpy.update.and.returnValue(throwError(() => new Error('ERROR')));
    matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      declarations: [ControlPanelConfigurationShopComponent],
      imports: [BrowserAnimationsModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTooltipModule, ReactiveFormsModule, RouterLink, RouterTestingModule.withRoutes(
        [{ path: 'control-panel/configuration/shops', component: ControlPanelConfigurationShopListComponent }]
      )],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ shopId: TestDataShops[0].Id }) } } },
        { provide: ShopService, useValue: shopServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        ControlPanelConfigurationShopComponent,
        HttpClient,
        HttpHandler,
        Router
      ]
    });
    fixture = TestBed.createComponent(ControlPanelConfigurationShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should trigger error handling when sending a call to the shop service when creating a new shop and the request fails', () => {
    component.activeMerchant = TestDataMerchants[0];
    component.queryStringShopId = '';
    component.controlName.setValue(TestDataShops[0].Name);
    component.controlSubDomain.setValue(TestDataShops[0].SubDomain!);
    component.onSubmit();
    expect(component.formLoading).toBeFalse();
  });

  it('should trigger error handling when sending a call to the shop service when updating an existing shop and the request fails', () => {
    component.queryStringShopId = TestDataShops[0].Id;
    component.controlName.setValue(TestDataShops[0].Name);
    component.controlSubDomain.setValue(TestDataShops[0].SubDomain!);
    component.onSubmit();
    expect(component.formLoading).toBeFalse();
  });

  it('should trigger error handling when sending a call to the shop service when checking subdomain availability and the request fails', () => {
    component.checkSubDomainAvailability('subdomain');
    expect(component.formLoading).toBeFalse();
  });
});