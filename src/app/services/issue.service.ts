import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class IssueService {

    private searchApiUrl = "https://ucbos.atlassian.net/rest/api/2/issue/"; // Replace with your proxy server URL

    constructor(private http: HttpClient) { }

    loadIssues(): Observable<any> {
        const searchTerm = 'project = MYAPP';
        return this.searchTickets(searchTerm);
    }

    searchTickets(searchTerm: string): Observable<any> {
       
        const url = `${this.searchApiUrl}?jql=${encodeURIComponent(searchTerm)}`;
        return this.http.get(url, {  }).pipe(
            map((response: any) => {
                try {
                    console.log('Response from API:', response); // Debugging
                    return this.extractRequiredFields(response.issues);
                } catch (error) {
                    console.error('Failed to parse response:', error);
                    return [];
                }
            }),
            catchError(error => {
                console.error('Error in API call:', error); // Log full error details
                const errorMessage = 'Failed to load issues: ' + error.message; // Include the error message in the returned error
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    private extractRequiredFields(tickets: any[]): any[] {
        return tickets.map(ticket => ({
            ticketId: ticket.key,
            jiraType: ticket.fields.issuetype.name,
            description: ticket.fields.summary,
            assignee: ticket.fields.assignee.displayName,
            status: ticket.fields.status.name,
            estimated: ticket.fields.customfield_10094,
            stopPoint: ticket.fields.customfield_10026,
            releaseTag: ticket.fields.customfield_10070 ? ticket.fields.customfield_10070[0].title : '',
            sprint: ticket.fields.customfield_10020 ? ticket.fields.customfield_10020.name : ''
        }));
    }
}
