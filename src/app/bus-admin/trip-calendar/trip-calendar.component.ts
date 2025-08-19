import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewChild, TemplateRef } from '@angular/core';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from 'src/app/theme/directives/directives.module';
import { ScheduleModule } from '@syncfusion/ej2-angular-schedule';
import { View, EventSettingsModel, PopupOpenEventArgs } from '@syncfusion/ej2-angular-schedule';
import * as ej2Base from '@syncfusion/ej2-base';





const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  },
  green: {
    primary: '#119c56'
  }
};

@Component({
  selector: 'app-trip-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, DirectivesModule, ScheduleModule],
  templateUrl: './trip-calendar.component.html',
  styleUrls: ['./trip-calendar.component.scss']
})
export class TripCalendarComponent implements OnInit {

  // @ViewChild('modalContent') modalContent: TemplateRef<any>;
  public setView: View = 'Month';

  @Input() data: any;

  view: string = 'month';

  viewDate: Date = new Date();

  modalData: {
    action: string,
    event: CalendarEvent
  };

  public selectedDate: Date = new Date(2018, 1, 15);
  public showWeekNumber: boolean = true;
  public isReadOnly: boolean = true;
  // public eventSettings: EventSettingsModel = { dataSource: scheduleData };

  // actions: CalendarEventAction[] = [{
  //   label: '<i class="fa fa-fw fa-pencil"></i>',
  //   onClick: ({ event }: { event: CalendarEvent }): void => {
  //     this.handleEvent('Edited', event);
  //   }
  // }, {
  //   label: '<i class="fa fa-fw fa-times"></i>',
  //   onClick: ({ event }: { event: CalendarEvent }): void => {
  //     this.events = this.events.filter(iEvent => iEvent !== event);
  //     this.handleEvent('Deleted', event);
  //   }
  // }];

  refresh: Subject<any> = new Subject();

  // events: CalendarEvent[] = [];
  public events: any[] = [];

  activeDayIsOpen: boolean = true;

  constructor(private modal: NgbModal) {}

  ngOnInit(): void {
  }

  public eventObject: EventSettingsModel = {
    dataSource: this.events
  }

  // change() {
  //   alert('call')
  //   this.events = [];
  //   if(this.data.length == 0){
  //     this.events = [];
  //   }
  //   console.log(this.data)

  //   for(let i=0;i<= this.data?.length;i++){

  //     const pickupdate = new Date(this.data[i]?.startDate);
  //     const pickDate = pickupdate.toLocaleDateString('en-GB');
  //     const pickupDatehrsmins= pickupdate.toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       });

  //     const dropdate = new Date(this.data[i]?.endDate);
  //     const endDate = dropdate.toLocaleDateString('en-GB');
  //     const newDropDate = addHours(dropdate, 0);
  //     const dropDatehrsmins= newDropDate.toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       });

  //     this.events.push({
  //       start: new Date(this.data[i]?.startDate),
  //       end: new Date(this.data[i]?.endDate),
  //       title:'Customer name: ' + this.data[i]?.customerName + "," + "<br>" + 
  //             'Picking address: ' + this.data[i]?.customerAddress + "," + "<br>" +
  //             'Pickup Date : ' + pickDate + " " + pickupDatehrsmins  + "<br>" +
  //             // 'Pickup Time: ' + pickupDatehrsmins + "," + "<br>" +
  //             'End Date : ' + endDate + " "  + dropDatehrsmins + "<br>" +	
  //             // 'Drop Time: ' + dropDatehrsmins + "," + "<br>" +
  //             'Contact number: ' + this.data[i]?.contactNumber,
  //       color: colors.green,
  //     })

  //     console.log(this.events)

  //   }

  // }

  change() {
    this.events = [];

    for (let i = 0; i < this.data?.length; i++) {
      this.events.push({
        Subject: 'Bus Booking Details',
        // StartTime: new Date(2023, 11, 5, 4, 0),
        // EndTime: new Date(2023, 11, 10, 4, 0),
        StartTime: new Date(this.data[i]?.startDate),
        EndTime: new Date(this.data[i]?.endDate),
        CustomerName: this.data[i]?.customerName,
        ContactNumber: this.data[i]?.contactNumber,
        CustomerAddress: this.data[i]?.customerAddress,
      });
      console.log(this.events)
    }

  }

  public onPopupOpen(args: PopupOpenEventArgs): void {
    if (args.type as string === 'QuickInfo') {
      setTimeout(() => {
        const eventDetails = args.data;
        const contentElement = args.element.querySelector('.e-event-popup');
        if (contentElement) {
          contentElement.innerHTML = `
            <div class="popup-content" style="background-color: #f0f0f0; padding: 10px; text-align: center; overflow-y: auto; z-index: 1000;">
              <div class="event-details">
                <p class="event-title" style="font-size: 24px; font-weight: bold; color: #3498db; margin-bottom: 10px;">${eventDetails.Subject}</p>
              </div>
              <br>
              <div class="customer-details">
                <p><strong>Pickup Date:</strong> ${eventDetails.StartTime.toLocaleString()}</p>
                <p><strong>End Date:</strong> ${eventDetails.EndTime.toLocaleString()}</p>
                <p><strong>Customer Name:</strong> ${eventDetails.CustomerName}</p>
                <p><strong>Contact Number:</strong> ${eventDetails.ContactNumber}</p>
                <p><strong>Customer Address:</strong> ${eventDetails.CustomerAddress}</p>
              </div>
            </div>
          `;
        }
      }, 0);
    }
  }

  dayClicked({ date, events }: { date: Date, events: CalendarEvent[] }): void {

    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  // eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
  //   event.start = newStart;
  //   event.end = newEnd;
  //   this.handleEvent('Dropped or resized', event);
  //   this.refresh.next(null);
  // }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }
}
