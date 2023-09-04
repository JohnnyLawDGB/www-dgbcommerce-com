import { CUSTOM_ELEMENTS_SCHEMA, Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Constants } from 'src/app/shared/Constants';
import { DatePipe } from '@angular/common';
import { Environment } from 'src/app/shared/environments/Environment';
import { FinancialStatementTransactionService } from './FinancialStatementTransaction.service';
import { GetFinancialStatementTransactionsParameters } from '../models/parameters/GetFinancialStatementTransactionsParameters.model';
import { TestBed } from '@angular/core/testing';

describe('FinancialStatementTransactionService', () => {
    let service: FinancialStatementTransactionService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [HttpClientTestingModule],
            providers: [
                DatePipe,
                FinancialStatementTransactionService
            ]
        });
        service = TestBed.inject(FinancialStatementTransactionService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be able to get a list of financial statement transactions', () => {
        const parameters: GetFinancialStatementTransactionsParameters = {
            DateFrom: new Date(),
            DateUntil: new Date(),
            Type: 0,
            CurrencyId: Constants.EMPTY_GUID,
            Recurrance: 0,
            Description: 'test'
        };

        service.getList(parameters).subscribe();
        const request = httpMock.expectOne(`${Environment.API_URL}/FinancialStatementTransaction?dateFrom=${service.datePipe.transform(parameters.DateFrom, 'yyyy-MM-dd')}&dateUntil=${service.datePipe.transform( parameters.DateUntil, 'yyyy-MM-dd')}&type=${parameters.Type}&currencyId=${parameters.CurrencyId}&recurrance=${parameters.Recurrance}&description=${parameters.Description}`);
        expect(request.request.method).toBe('GET');
    });

    it('should be able to get a single financial statement transaction', () => {
        service.getById(Constants.EMPTY_GUID).subscribe();
        const request = httpMock.expectOne(Environment.API_URL + '/FinancialStatementTransaction/' + Constants.EMPTY_GUID);
        expect(request.request.method).toBe('GET');
    });
});