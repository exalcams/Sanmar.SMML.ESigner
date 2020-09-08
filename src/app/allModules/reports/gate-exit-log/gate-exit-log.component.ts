import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatIconRegistry, MatPaginator, MatTableDataSource, MatSort, MatDatepickerInputEvent } from '@angular/material';
import { Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/services/report.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { Guid } from 'guid-typescript';
import { GateExitLogDetails, ReportFilters } from 'app/models/report';

@Component({
  selector: 'gate-exit-log',
  templateUrl: './gate-exit-log.component.html',
  styleUrls: ['./gate-exit-log.component.scss'],
  animations: fuseAnimations
})
export class GateExitLogComponent implements OnInit, OnDestroy {
  AllGateExitLogDetails: GateExitLogDetails[] = [];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  SetIntervalID: any;
  reportFormGroup: FormGroup;
  AllEwaybillNos: string[] = [];
  AllPlants: string[] = [];
  reportFilters: ReportFilters;
  diagramShow = true;
  content1Show = false;
  content1ShowName: string;
  // tslint:disable-next-line:max-line-length
  displayedColumns: string[] = [ 'InvoiceNumber', 'EWayBillNumber', 'ReferenceNO', 'Status', 'QRCodeScanTime','CREATED_ON'];
  dataSource: MatTableDataSource<GateExitLogDetails>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private _router: Router,
    public snackBar: MatSnackBar,
    private _reportService: ReportService,
    private _formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = true;
    this.reportFormGroup = this._formBuilder.group({
      EWAYBILL_NO: [''],
      FROMDATE: [''],
      TODATE: [''],
      // PLANT: ['']
      // FROMDATE: ['', Validators.required],
      // TODATE: ['', Validators.required]
    });
  }


  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
    } else {
      this._router.navigate(['/auth/login']);
    }

    this.GetAllEwaybillNos();
    this.GetAllGateExitLogs();
    // this.SetIntervalID = setInterval(() => {
    //   this.GetAllGateExitLogs();
    // }, 3000);

  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    if (this.SetIntervalID) {
      clearInterval(this.SetIntervalID);
    }
  }

  // tslint:disable-next-line:typedef
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  @ViewChild('TABLE') table: ElementRef;

  GetAllEwaybillNos(): void {
    this._reportService.GetAllEwaybillNos(this.authenticationDetails.userID).subscribe((data) => {
      if (data) {
        this.AllEwaybillNos = data as string[];
      }
    },
      (err) => {
        console.log(err);
      });
  }

  GetAllGateExitLogs(): void {
    this._reportService.GetAllGateExitLogs(this.authenticationDetails.userID).subscribe(
      (data) => {
        this.AllGateExitLogDetails = data as GateExitLogDetails[];
        //console.log(this.AllGateExitLogDetails);
        if (this.AllGateExitLogDetails.length > 0) {
          this.dataSource = new MatTableDataSource(this.AllGateExitLogDetails);
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'TAT': {
                return item.TAT_TIMESPAN_VAL;
              }
              default: {
                return item[property];
              }
            }
          };
          //console.log(this.AllGateExitLogDetails);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.log(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetAllGateExitLogsBasedOnFilter(): void {
    if (this.reportFormGroup.valid) {
      this.IsProgressBarVisibile = true;
      const EWAYBILL_NO: string = this.reportFormGroup.get('EWAYBILL_NO').value;
      // const PLANT: string = this.reportFormGroup.get('PLANT').value;
      const FROMDATE = this.datePipe.transform(this.reportFormGroup.get('FROMDATE').value as Date, 'yyyy-MM-dd');
      const TODATE = this.datePipe.transform(this.reportFormGroup.get('TODATE').value as Date, 'yyyy-MM-dd');
      const USERID: number = this.authenticationDetails.userID;
      this.reportFilters = new ReportFilters();
      this.reportFilters.UserID = USERID;
      this.reportFilters.EWAYBILL_NO = EWAYBILL_NO;
      // this.reportFilters.PLANT = PLANT;
      this.reportFilters.FROMDATE = FROMDATE;
      this.reportFilters.TODATE = TODATE;
      // tslint:disable-next-line:max-line-length
      if ((this.reportFilters.EWAYBILL_NO !== '' && this.reportFilters.EWAYBILL_NO !== null) && ((this.reportFilters.FROMDATE === '' && this.reportFilters.TODATE === '') || (this.reportFilters.FROMDATE === null && this.reportFilters.TODATE === null))) {
        // this.authenticationDetails.userID, EWAYBILL_NO, FROMDATE, TODATE
        this._reportService.GetAllGateExitLogsBasedOnEwaybillNoFilter(this.reportFilters)
          .subscribe((data) => {
            this.AllGateExitLogDetails = data as GateExitLogDetails[];
            // if (this.AllGateExitLogDetails.length > 0) {
            //   // this.AllGateExitLogDetails.forEach(element => {
            //   //   element.InvoiceNumber = element.InvoiceNumber == 'L' ? 'Loading' :
            //   //     element.InvoiceNumber == 'UL' ? 'Unloading' : element.InvoiceNumber == 'ULL' ? 'Unloading And Loading' : '';
            //   //   element.CUR_STATUS = element.CUR_STATUS == 'GENTRY' ? 'Gate Entry' :
            //   //     element.CUR_STATUS == 'ULENTRY' ? 'Unloading Entry' : element.CUR_STATUS == 'ULEXIT' ? 'Unloading Exit' :
            //   //       element.CUR_STATUS == 'LEXIT' ? 'Loading Exit' : element.CUR_STATUS == 'LENTRY' ? 'Loading Entry' :
            //   //         element.CUR_STATUS == 'PENTRY' ? 'Parking Entry' : element.CUR_STATUS == 'PEXIT' ? 'Parking Exit' :
            //   //           element.CUR_STATUS == 'GEXIT' ? 'Gate Exit' : element.CUR_STATUS == 'W1ENTRY' ? 'Weighment 1 Entry' :
            //   //             element.CUR_STATUS == 'W1EXIT' ? 'Weighment 1 Exit' :
            //   //               element.CUR_STATUS == 'W2ENTRY' ? 'Weighment 2 Entry' : element.CUR_STATUS == 'W2EXIT' ? 'Weighment 2 Exit' : '';

            //   //   element.GENTRY_TIME_ONLY = this.datePipe.transform(element.GENTRY_TIME, 'hh:mm:ss a');
            //   //   element.GENTRY_DATE_ONLY = this.datePipe.transform(element.GENTRY_TIME, 'dd-MM-yyyy');
            //   //   element.GEXIT_TIME_ONLY = this.datePipe.transform(element.GEXIT_TIME, 'hh:mm:ss a');
            //   //   element.GEXIT_DATE_ONLY = this.datePipe.transform(element.GEXIT_TIME, 'dd-MM-yyyy');
            //   //   if (element.GEXIT_TIME && element.GENTRY_TIME && element.GEXIT_TIME != null && element.GENTRY_TIME != null) {
            //   //     element.TOTAL_GATE_DURATION = this.getTimeInSentence(element.GEXIT_TIME.toString(), element.GENTRY_TIME.toString());
            //   //     element.TOTAL_GATE_TIME_HMS = this.getTimeInHMSFormat(element.GEXIT_TIME.toString(), element.GENTRY_TIME.toString());
            //   //   }
            //   //   element.PENTRY_TIME_ONLY = this.datePipe.transform(element.PENTRY_TIME, 'hh:mm:ss a');
            //   //   element.PENTRY_DATE_ONLY = this.datePipe.transform(element.PENTRY_TIME, 'dd-MM-yyyy');
            //   //   element.PEXIT_TIME_ONLY = this.datePipe.transform(element.PEXIT_TIME, 'hh:mm:ss a');
            //   //   element.PEXIT_DATE_ONLY = this.datePipe.transform(element.PEXIT_TIME, 'dd-MM-yyyy');
            //   //   if (element.PEXIT_TIME && element.PENTRY_TIME && element.PEXIT_TIME != null && element.PENTRY_TIME != null) {
            //   //     element.TOTAL_PARKING_DURATION = this.getTimeInSentence(element.PEXIT_TIME.toString(), element.PENTRY_TIME.toString());
            //   //     element.TOTAL_PARKING_TIME_HMS = this.getTimeInHMSFormat(element.PEXIT_TIME.toString(), element.PENTRY_TIME.toString());
            //   //   }
            //   //   element.W1ENTRY_TIME_ONLY = this.datePipe.transform(element.W1ENTRY_TIME, 'hh:mm:ss a');
            //   //   element.W1ENTRY_DATE_ONLY = this.datePipe.transform(element.W1ENTRY_TIME, 'dd-MM-yyyy');
            //   //   element.W1EXIT_TIME_ONLY = this.datePipe.transform(element.W1EXIT_TIME, 'hh:mm:ss a');
            //   //   element.W1EXIT_DATE_ONLY = this.datePipe.transform(element.W1EXIT_TIME, 'dd-MM-yyyy');
            //   //   if (element.W1EXIT_TIME && element.W1ENTRY_TIME && element.W1EXIT_TIME != null && element.W1ENTRY_TIME != null) {
            //   //     element.TOTAL_WEIGHMENT1_DURATION = this.getTimeInSentence(element.W1EXIT_TIME.toString(), element.W1ENTRY_TIME.toString());
            //   //     element.TOTAL_WEIGHMENT1_TIME_HMS = this.getTimeInHMSFormat(element.W1EXIT_TIME.toString(), element.W1ENTRY_TIME.toString());
            //   //   }
            //   //   element.LENTRY_TIME_ONLY = this.datePipe.transform(element.LENTRY_TIME, 'hh:mm:ss a');
            //   //   element.LENTRY_DATE_ONLY = this.datePipe.transform(element.LENTRY_TIME, 'dd-MM-yyyy');
            //   //   element.LEXIT_TIME_ONLY = this.datePipe.transform(element.LEXIT_TIME, 'hh:mm:ss a');
            //   //   element.LEXIT_DATE_ONLY = this.datePipe.transform(element.LEXIT_TIME, 'dd-MM-yyyy');
            //   //   if (element.LEXIT_TIME && element.LENTRY_TIME && element.LEXIT_TIME != null && element.LENTRY_TIME != null) {
            //   //     element.TOTAL_LOADING_DURATION = this.getTimeInSentence(element.LEXIT_TIME.toString(), element.LENTRY_TIME.toString());
            //   //     element.TOTAL_LOADING_TIME_HMS = this.getTimeInHMSFormat(element.LEXIT_TIME.toString(), element.LENTRY_TIME.toString());

            //   //   }
            //   //   element.ULENTRY_TIME_ONLY = this.datePipe.transform(element.ULENTRY_TIME, 'hh:mm:ss a');
            //   //   element.ULENTRY_DATE_ONLY = this.datePipe.transform(element.ULENTRY_TIME, 'dd-MM-yyyy');
            //   //   element.ULEXIT_TIME_ONLY = this.datePipe.transform(element.ULEXIT_TIME, 'hh:mm:ss a');
            //   //   element.ULEXIT_DATE_ONLY = this.datePipe.transform(element.ULEXIT_TIME, 'dd-MM-yyyy');
            //   //   if (element.ULEXIT_TIME && element.ULENTRY_TIME && element.ULEXIT_TIME != null && element.ULENTRY_TIME != null) {
            //   //     element.TOTAL_UNLOADING_DURATION = this.getTimeInSentence(element.ULEXIT_TIME.toString(), element.ULENTRY_TIME.toString());
            //   //     element.TOTAL_UNLOADING_TIME_HMS = this.getTimeInHMSFormat(element.ULEXIT_TIME.toString(), element.ULENTRY_TIME.toString());

            //   //   }
            //   //   element.W2ENTRY_TIME_ONLY = this.datePipe.transform(element.W2ENTRY_TIME, 'hh:mm:ss a');
            //   //   element.W2ENTRY_DATE_ONLY = this.datePipe.transform(element.W2ENTRY_TIME, 'dd-MM-yyyy');
            //   //   element.W2EXIT_TIME_ONLY = this.datePipe.transform(element.W2EXIT_TIME, 'hh:mm:ss a');
            //   //   element.W2EXIT_DATE_ONLY = this.datePipe.transform(element.W2EXIT_TIME, 'dd-MM-yyyy');
            //   //   if (element.W2EXIT_TIME && element.W2ENTRY_TIME && element.W2EXIT_TIME != null && element.W2ENTRY_TIME != null) {
            //   //     element.TOTAL_WEIGHMENT2_DURATION = this.getTimeInSentence(element.W2EXIT_TIME.toString(), element.W2ENTRY_TIME.toString());
            //   //     element.TOTAL_WEIGHMENT2_TIME_HMS = this.getTimeInHMSFormat(element.W2EXIT_TIME.toString(), element.W2ENTRY_TIME.toString());

            //   //   }
            //   //   if (element.GEXIT_TIME && element.W2ENTRY_TIME && element.GEXIT_TIME != null && element.W2ENTRY_TIME != null) {
            //   //     element.TOTAL_WEIGHMENT2_GEXIT_DURATION = this.getTimeInSentence(element.GEXIT_TIME.toString(), element.W2ENTRY_TIME.toString());
            //   //     element.TOTAL_WEIGHMENT2_GEXIT_TIME_HMS = this.getTimeInHMSFormat(element.GEXIT_TIME.toString(), element.W2ENTRY_TIME.toString());
            //   //   }

            //   //   //ATL and BAY Date Calculation
            //   //   if (element.ATL_ASSIGN_DATE != '' && element.ATL_ASSIGN_DATE != null) {
            //   //     var date = new Date(element.ATL_ASSIGN_DATE);
            //   //     if (this.isValidDate(date)) {
            //   //       element.ATL_ASSIGN_DATE = this.datePipe.transform(date, 'dd-MM-yyyy');
            //   //     }
            //   //   }

            //   //   if (element.BAY_ASSIGN_DATE != '' && element.BAY_ASSIGN_DATE != null) {
            //   //     var date1 = new Date(element.BAY_ASSIGN_DATE);
            //   //     if (this.isValidDate(date1)) {
            //   //       element.BAY_ASSIGN_DATE = this.datePipe.transform(date1, 'dd-MM-yyyy');
            //   //     }
            //   //   }

            //   //   if (element.GENTRY_TIME && element.ATL_ASSIGN_TIME && element.GENTRY_TIME != null && element.ATL_ASSIGN_TIME != '' && element.ATL_ASSIGN_TIME != null && element.ATL_ASSIGN_DATE != '' && element.ATL_ASSIGN_DATE != null) {
            //   //     var d = new Date(element.ATL_ASSIGN_DATE);
            //   //     if (this.isValidDate(d)) {
            //   //       var newDate = this.datePipe.transform(d, 'dd-MM-yyyy')
            //   //       var date11 = new Date(newDate + " " + element.ATL_ASSIGN_TIME);
            //   //       element.TOTAL_GENTRY_ATLASSIGN_TIME_HMS = this.getTimeInHMSFormat(date11.toString(), element.GENTRY_TIME.toString());
            //   //     }
            //   //   }

            //   //   if (element.GENTRY_TIME && element.ATL_ASSIGN_TIME && element.GENTRY_TIME != null && element.ATL_ASSIGN_TIME != '' && element.ATL_ASSIGN_TIME != null && element.ATL_ASSIGN_DATE != '' && element.ATL_ASSIGN_DATE != null) {
            //   //     var d1 = new Date(element.ATL_ASSIGN_DATE);
            //   //     if (this.isValidDate(d1)) {
            //   //       var newDate = this.datePipe.transform(d1, 'dd-MM-yyyy')
            //   //       var date11 = new Date(newDate + " " + element.ATL_ASSIGN_TIME);
            //   //       element.TOTAL_GENTRY_ATLASSIGN_TIME_HMS = this.getTimeInSentence(date11.toString(), element.GENTRY_TIME.toString());
            //   //     }
            //   //   }

            //   //   if (element.BAY_ASSIGN_TIME && element.ATL_ASSIGN_TIME && element.BAY_ASSIGN_TIME != '' && element.ATL_ASSIGN_TIME != '' && element.BAY_ASSIGN_TIME != null && element.ATL_ASSIGN_TIME != null && element.ATL_ASSIGN_DATE != '' && element.ATL_ASSIGN_DATE != null) {
            //   //     var atlAssignDate1 = new Date(element.ATL_ASSIGN_DATE);
            //   //     var bayAssignDate1 = new Date(element.BAY_ASSIGN_DATE);
            //   //     if (this.isValidDate(atlAssignDate1) && this.isValidDate(bayAssignDate1)) {
            //   //       var newDate = this.datePipe.transform(atlAssignDate1, 'dd-MM-yyyy')
            //   //       var date11 = new Date(newDate + " " + element.ATL_ASSIGN_TIME);
            //   //       var newDate1 = this.datePipe.transform(bayAssignDate1, 'dd-MM-yyyy')
            //   //       var date111 = new Date(newDate1 + " " + element.BAY_ASSIGN_TIME);
            //   //       element.TOTAL_ATL_BAYASSIGN_TIME_HMS = this.getTimeInHMSFormat(date111, date11);
            //   //     }
            //   //   }

            //   //   if (element.BAY_ASSIGN_TIME && element.ATL_ASSIGN_TIME && element.BAY_ASSIGN_TIME != '' && element.ATL_ASSIGN_TIME != '' && element.BAY_ASSIGN_TIME != null && element.ATL_ASSIGN_TIME != null && element.ATL_ASSIGN_DATE != '' && element.ATL_ASSIGN_DATE != null && element.BAY_ASSIGN_DATE != '' && element.BAY_ASSIGN_DATE != null) {
            //   //     var atlAssignDate = new Date(element.ATL_ASSIGN_DATE);
            //   //     var bayAssignDate = new Date(element.BAY_ASSIGN_DATE);
            //   //     if (this.isValidDate(atlAssignDate) && this.isValidDate(bayAssignDate)) {
            //   //       var newDate = this.datePipe.transform(atlAssignDate, 'dd-MM-yyyy')
            //   //       var date11 = new Date(newDate + " " + element.ATL_ASSIGN_TIME);
            //   //       var newDate1 = this.datePipe.transform(bayAssignDate, 'dd-MM-yyyy')
            //   //       var date111 = new Date(newDate1 + " " + element.BAY_ASSIGN_TIME);
            //   //       element.TOTAL_ATL_BAYASSIGN_TIME_HMS = this.getTimeInSentence(date111.toString(), date11.toString());
            //   //     }
            //   //   }

            //   // });
            //   this.IsProgressBarVisibile=false;
            //   this.dataSource = new MatTableDataSource(this.AllGateExitLogDetails);
            //   console.log(this.AllGateExitLogDetails);
            //   this.dataSource.paginator = this.paginator;
            //   this.dataSource.sort = this.sort;
            // }
            this.dataSource = new MatTableDataSource(this.AllGateExitLogDetails);
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'TAT': {
                  console.log('Inside TAT');
                  return item.TAT_TIMESPAN_VAL;
                }
                default: {
                  console.log('Inside default sort');
                  return item[property];
                }
              }
            };
            this.dataSource.paginator = this.paginator;
            // this.dataSource.paginator.pageSizeOptions=[10, 20,50, this.AllGateExitLogDetails.length];
            this.dataSource.paginator.pageSize = this.AllGateExitLogDetails.length;
            this.dataSource.sort = this.sort;
            // }
            this.IsProgressBarVisibile = false;
          },
            (err) => {
              console.log(err);
            });
      }
      // tslint:disable-next-line:max-line-length
      else if ((this.reportFilters.EWAYBILL_NO === '' || this.reportFilters.EWAYBILL_NO === null) && ((this.reportFilters.FROMDATE !== '' && this.reportFilters.TODATE !== '') && (this.reportFilters.FROMDATE !== null && this.reportFilters.TODATE !== null))) {
        // this.authenticationDetails.userID, EWAYBILL_NO, FROMDATE, TODATE
        this._reportService.GetAllGateExitLogsBasedOnDateFilter(this.reportFilters)
          .subscribe((data) => {
            this.AllGateExitLogDetails = data as GateExitLogDetails[];

            this.dataSource = new MatTableDataSource(this.AllGateExitLogDetails);
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'TAT': {
                  return item.TAT_TIMESPAN_VAL;
                }
                default: {
                  return item[property];
                }
              }
            };
            this.dataSource.paginator = this.paginator;
            // this.dataSource.paginator.pageSizeOptions=[10, 20,50, this.AllGateExitLogDetails.length];
            this.dataSource.paginator.pageSize = this.AllGateExitLogDetails.length;
            this.dataSource.sort = this.sort;
            this.IsProgressBarVisibile = false;
          },
            (err) => {
              console.log(err);
            });
      }
      // else if ((this.reportFilters.PLANT !== '' && this.reportFilters.PLANT !== null) && (this.reportFilters.EWAYBILL_NO === '' || this.reportFilters.EWAYBILL_NO === null) && ((this.reportFilters.FROMDATE === '' && this.reportFilters.TODATE === '') || (this.reportFilters.FROMDATE === null && this.reportFilters.TODATE === null))) {
      //   this._reportService.GetAllGateExitLogsBasedOnPlantFilter(this.reportFilters)
      //     .subscribe((data) => {
      //       this.AllGateExitLogDetails = data as GateExitLogDetails[];
      //       this.dataSource = new MatTableDataSource(this.AllGateExitLogDetails);
      //       this.dataSource.sortingDataAccessor = (item, property) => {
      //         switch (property) {
      //           case 'TAT': {
      //             console.log('Inside TAT');
      //             return item.TAT_TIMESPAN_VAL;
      //           }
      //           default: {
      //             console.log('Inside default sort');
      //             return item[property];
      //           }
      //         }
      //       };
      //       this.dataSource.paginator = this.paginator;
      //       this.dataSource.paginator.pageSize = this.AllGateExitLogDetails.length;
      //       this.dataSource.sort = this.sort;
      //       this.IsProgressBarVisibile = false;
      //     },
      //       (err) => {
      //         console.log(err);
      //       });
      // }
      else {
        this.notificationSnackBarComponent.openSnackBar('It requires at least a field or From Date and To Date', SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    }
    Object.keys(this.reportFormGroup.controls).forEach(key => {
      this.reportFormGroup.get(key).markAsTouched();
      this.reportFormGroup.get(key).markAsDirty();
    });
    //this.reportFormGroup.reset();
  }

  clearFromToDateAndEwaybillNo(): void {
    this.reportFormGroup.get('FROMDATE').patchValue('');
    this.reportFormGroup.get('TODATE').patchValue('');
    this.reportFormGroup.get('EWAYBILL_NO').patchValue('');
  }

  clearFromToDateAndPlant(): void {
    this.reportFormGroup.get('FROMDATE').patchValue('');
    this.reportFormGroup.get('TODATE').patchValue('');
    // this.reportFormGroup.get('PLANT').patchValue('');
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.reportFormGroup.get('EWAYBILL_NO').patchValue('');
    // this.reportFormGroup.get('PLANT').patchValue('');
  }
}
