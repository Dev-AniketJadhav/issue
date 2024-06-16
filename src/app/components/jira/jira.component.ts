import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { PlatformLocation } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { IssueService } from '../../services/issue.service';
//import { IssueService } from '../../services/issue.service';
interface sideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

interface Data {
  id: string;
  name: string;
  description: string;
  assignee: string;
  status: string;
  timeestimate: string;
}

@Component({
  selector: 'app-jira',
  templateUrl: './jira.component.html',
  styleUrls: ['./jira.component.css']
})
export class JiraComponent implements OnInit {
  issues: any[] = [];
  ticket: any[] = [];
  dataLoaded: boolean = false;
  checked: boolean;
  tickets: any;
  position: string;

  constructor(
      
     // private isu: TicketDetailsService,
      private platformLocation: PlatformLocation,
      private http: HttpClient,
      public authService: AuthService,
      private confirmationService: ConfirmationService,
      private messageService: MessageService,
      private issueService: IssueService
    ) {
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }

  isSideNavCollapsed = false;
  screenWidth = 0;
  ticketsData: any;

  ngOnInit() {
    this.loadIssues();
    this.searchTickets('UCB-1234, UCG-1236');

  }

  confirmPosition(position: string) {
    this.position = position;

    this.confirmationService.confirm({
      message: 'Do you want to update estimated time?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record Updated' });
      },
      reject: (type) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have not updated' });
            break;
          case ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have not updated' });
            break;
        }
      },
      key: 'positionDialog'
    });
  }

  loadIssues() {
    console.log('loadIssues called');
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic YOUR_BASE64_ENCODED_CREDENTIALS' // Replace with your credentials
      })
    };

    this.http.get<any>('/api/rest/api/2/search', httpOptions).subscribe(
      (response) => {
        console.log('Data fetched from API:', response);
        this.issues = response.issues;
        this.dataLoaded = true;
        console.log('Issues loaded:', this.issues);
      },
      (error) => {
        console.error('Failed to load issues:', error);
      }
    );
  }

  onSave() {
    console.log('onSave called');
    console.log('Current state of issues:', this.issues);

    if (!this.dataLoaded) {
      console.error('Data not loaded yet.');
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    let url = "https://dreaminnovator.atlassian.net/rest/api/2/search";

    if (Array.isArray(this.issues) && this.issues.length > 0) {
      for (let issue of this.issues) {
        this.http.get(url, httpOptions).subscribe(
          (response) => {
            let parsedData = JSON.parse(JSON.stringify(response));
            console.log('Response for issue:', issue, parsedData);
          },
          (error) => {
            console.error('An error occurred for issue:', issue, error);
          }
        );
      }
    } else {
      console.error("No issues found or 'this.issues' is not an array.");
    }
  }
  searchTickets(searchTerm: string): void {
      this.issueService.searchTickets(searchTerm).subscribe(response => {
        this.tickets = response;
        console.log(response);
        
      });
    } }


