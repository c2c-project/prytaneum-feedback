# Feedback Portal - Design Document
​
## High-level
​
The feedback portal micro-service manages the API endpoints and database necessaries to let Prytaneum users create feedback and bug reports
​
## Interaction
​
The feedback portal micro-service interacts with the following micro-services:
​
-   Email Sender
-   Administrator
​
## Database - Mongodb
​
### feedback-reports
​
Collection that stores feedback reports of the form:
​
```
    {
        _id: ObjectId,
        date: String, // UTC
        description: String,
        submitterId: ObjectId
    }
```
​
### bug-reports
​
Collection that stores bug reports of the form:
​
​
```
    {
        _id: ObjectId,
        date: String, // UTC
        townhallId: ObjectId // tentative
        description: String,
        submitterId: ObjectId
    }
```
​
## API Endpoints
​
-   /feedback
    -   /create-report
        -   ***Special Interaction: Calls the Email Sender micro-service***
        -   HTTP Method: Post
        -   Description: Creates a report and inserts it in the feedback-reports collection
        -   Permission needed: regular user
        -   Body of request:
                ```
                    {
                        date: String, // UTC
                        description: String,
                        user: {
                            _id: ObjectId
                        }
                    }
                ```
        -   Response:
            -   status 200:
                -   message: 'Feedback successfully submitted' 
            -   status 400:
                -   message: 'Some error occurred. Please try again' 
​
    -   /get-reports
        -   ***Special Interaction: This API endpoint can only called by the Administrator micro-service***
        -   HTTP Method: Get
        -   Description: Retrieves at most 10 reports from the feedback-reports collection, depending on the page number and resolved status provided
        -   Permission needed: Admin user
        -   Body of request:
            ```
                {
                    page: Number, // Page number of reports
                    sortByDate: Boolean, // Sort by date order
                    resolved: Boolean // Resolved status of reports to return
                }
            ```
        -   Response:
            -   status 200:
                - data:
                    ```
                        {
                            reports: Array,  // Array of feedback reports, possibly empty
                            count: Number   // Total count of feedback reports in the collection
                        }
                    ```
            -   status 400:
                -   message: 'Some error occurred. Please try again' 
    
    -  /get-reports/:submitterId
        - HTTP Method: Get
        - Description: Retrieves at most 10 feedback reports submitted by a specific user, depending on the page number provided
        - Permission needed: Calling user must posses the same Id as the one provided in the request parameters
        - Body of the request:
            ```
                {
                    page: Number, // Page number of reports
                    sortByDate: Boolean, // Sort by date order
                    user: {
                        _id: ObjectId // Id of calling User
                    },
                }
            ```
        - Parameters:
            ```
                {
                    submitterId: ObjectId
                }
            ```
        - Response:
            -   status 200:
                - data:
                ```
                    {
                        reports: Array, // Array of feedback reports from the specified submitter, possibly empty
                        count: Number  // Count of feedback reports submitted by the user
                    }
                ```
            -   status 400:
                -   message: 'Some error occurred. Please try again' 
​
​
    -  /update-report
        - HTTP Method: POST
        - Description: Updates the description of a specific report from the feedback-reports collection
        - Permission needed: Calling user must be owner of the feedback report
        - Body of request:
            ```
                {
                    _id: ObjectId, // Id of the report to update
                    newDescription: String // New description of the specified feedback report
                }
            ```
        - Response:
            - status 200:
                - message: 'Feedback report successfully updated'
            - status 400:
                - message: 'Some error occurred. Please try again'
​
​
    -  /delete-report
        - HTTP Method: POST
        - Description: Deletes a specific report from the feedback-reports collection
        - Permission needed: Calling user must be owner of the feedback report
        - Body of request:
            ```
                {
                    _id: ObjectId // Id of the report to delete
                }
            ```
        - Response:
            - status 200:
                - message: 'Feedback report successfully deleted'
            - status 400:
                - message: 'Some error occurred. Please try again'
    
    -  /updateResolvedStatus/:_id
        - HTTP Method: POST
        - Description: Marks a feedback report as resolved or unresolved
        - Permission needed: Admin user
        - Parameters:
            ```
                {
                    _id: ObjectId // Id of report to update its resolvedStatus
                }
            ```
        - Body of request:
            ```
                {
                    resolvedStatus: Boolean // Value used to set the resolved of the report. true for resolved. false for unresolved
                }
            ```
        - Response:
            - status 200:
                - message: 'Resolved status successfully updated'
            - status 400:
                - message: 'Some error occurred. Please try again'

    -  /replyTo/:_id
        - HTTP Method: POST
        - Description: Adds a reply to a feedback report
        - Permission needed: Admin user
        - Parameters:
            ```
                {
                    _id: ObjectId // Id of report to update its resolvedStatus
                }
            ```
        - Body of request:
            ```
                {
                    user: {
                        _id: ObjectId // Id of calling User (replier)
                    },
                    replyContent: String, // Content of the reply
                    repliedDate: string // Date when reply is submitted
                }
            ```
        - Response:
            - status 200:
                - message: 'Reply successfully submitted'
            - status 400:
                - message: 'Some error occurred. Please try again'
​
​
-   /bugs
    -   /create-report
        -   ***Special Interaction: Calls the Email Sender micro-service***
        -   HTTP Method: Post
        -   Description: Creates a report and inserts it in the bugs-reports collection
        -   Permission needed: Regular user          
        -   Body of request:
            ```
                {
                    date: String, // UTC
                    townhallId: ObjectId,
                    description: String,
                    user: {
                        _id: ObjectId
                    }
                }
            ```
        -   Response:
            -   status 200:
                -   message: 'Bug report successfully submitted'
            -   status 400:
                -   message: 'Some error occurred. Please try again'
​
​
    -   /get-reports
        -   ***Special Interaction: This API endpoint is only called by the Administrator micro-service***
        -   HTTP Method: Get
        -   Description: Retrieves at most 10 reports from the bug-reports collection, depending on the page number and resolved status provided
        -   Permission needed: Admin user
        -   Body of the request:
            ```
                {
                    page: Number, // Page number of reports
                    sortByDate: Boolean, // Sort by date order
                    resolved: Boolean // Resolved status of reports to return
                }
            ```
        -   Response:
            -   status 200:
                - data :
                    ```
                        {
                            reports: Array, // Array of bug reports, possibly empty
                            count: Number  // Total count of bug reports in the collection
                        }
                    ```
            -   status 400:
                -   message: 'Some error occurred. Please try again' 
           
    -  /get-reports/:submitterId
        - HTTP Method: Get
        - Description: Retrieves at most 10 bug reports created by a specific user, depending on the page number and resolved status provided
        - Permission needed: Calling user must have the same Id as the one provided in the request parameters
        - Body of the request:
            ```
                {
                    page: Number, // Page number of reports
                    sortByDate: Boolean, // Sort by date order 
                    user: {
                        _id: ObjectId // Id of calling User
                    },
                }
            ```
        - Parameters:
            ```
                {
                    submitterId: ObjectId
                }
            ```
        - Response:
            -   status 200:
                - data:
                    ```
                        {
                            reports: Array, // Array of bug reports from the specified submitter, possibly empty
                            count: Number  // Number of bug reports by the user
                        }
                    ```
            -   status 400:
                -   message: 'Some error occurred. Please try again' 
            
    -  /update-report
        - HTTP Method: POST
        - Description: Updates the description of a specific report from the bug-reports collection
        - Permission needed: Calling user must be owner of the bug report
        - Body of request:
            ```
                {
                    _id: ObjectId, // Id of the report to update
                    newDescription: String // New description of the specified bug report
                }
            ```
        - Response:
            - status 200:
                - message: 'Bug report successfully updated'
            - status 400:
                - message: 'Some error occurred. Please try again'
​
    -  /delete-report
        - HTTP Method: POST
        - Description: Deletes a specific report from the bug-reports collection
        - Permission needed: Calling user must be owner of the bug report
        - Body of request:
            ```
                {
                    _id: ObjectId // Id of the report to delete
                }
            ```
        - Response:
            - status 200:
                - message: 'Bug report successfully deleted'
            - status 400:
                - message: 'Some error occurred. Please try again'


    -  /updateResolvedStatus/:_id
        - HTTP Method: POST
        - Description: Marks a bug report as resolved or unresolved
        - Permission needed: Admin user
        - Parameters:
            ```
                {
                    _id: ObjectId // Id of report to update its resolvedStatus
                }
            ```
        - Body of request:
            ```
                {
                    resolvedStatus: Boolean // Value used to set the resolved of the report. true for resolved. false for unresolved
                }
            ```
        - Response:
            - status 200:
                - message: 'Resolved status successfully updated'
            - status 400:
                - message: 'Some error occurred. Please try again'

    -  /replyTo/:_id
        - HTTP Method: POST
        - Description: Adds a reply to a bug report
        - Permission needed: Admin user
        - Parameters:
            ```
                {
                    _id: ObjectId // Id of report to update its resolvedStatus
                }
            ```
        - Body of request:
            ```
                {
                    user: {
                        _id: ObjectId // Id of calling User (replier)
                    },
                    replyContent: String, // Content of the reply
                    repliedDate: string // Date when reply is submitted
                }
            ```
        - Response:
            - status 200:
                - message: 'Reply successfully submitted'
            - status 400:
                - message: 'Some error occurred. Please try again'