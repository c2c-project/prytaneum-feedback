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
## Database - MongoDB
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
                    user : {
                        _id: ObjectId
                    }
                }
            ```
        -   Response:
            -   status 200:
                -   message: 'Feedback successfully submitted' 
            -   status 400 :
                -   message: 'Some error occurred. Please try again' 
​
    -   /get-reports
        -   ***Special Interaction: This API endpoint is only called by the Administrator micro-service***
        -   HTTP Method: Get
        -   Description: Retrieves all reports from the feedback-reports collection
        -   Permission needed: Admin user
        -   Parameters of request: None
        -   Response:
            -   status 200:
                - data :
                ```
                    {
                        reports: Array  // Array of feedback reports, possibly empty
                    }
                ```
            -   status 400 :
                -   message: 'Some error occurred. Please try again' 
    
    -  /get-reports/:submitterId
        - HTTP Method: Get
        - Description: Retrieves all feedback reports created by a specific submitter
        - Permission needed: Calling user must posses the same Id as the one provided in the request parameters
        - Parameters of request: ID of submitter
        - Response:
            -   status 200:
                - data :
                ```
                    {
                        reports: Array  // Array of feedback reports from the specified submitter, possibly empty
                    }
                ```
            -   status 400 :
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
                    _id : ObjectId // Id of the report to update
                    newDescription: String // New description of the specified feedback report
                }
            ```
        - Response:
            - status 200 :
                - message: 'Feedback report successfully updated'
            - status 400 :
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
                    _id : ObjectId // Id of the report to delete
                }
            ```
        - Response:
            - status 200 :
                - message: 'Feedback report successfully deleted'
            - status 400 :
                - message: 'Some error occurred. Please try again'
​
​
-   /bugs
    -   /create-report
        -   ***Special Interaction: Calls the Email Sender micro-service***
        -   HTTP Method: Post
        -   Description: Creates a report and inserts it in the bugs-reports collection
        -   Permission needed: regular user
        -   Body of request:
            ```
                {
                    date: String, // UTC
                    townhallId: ObjectId // tentative
                    description: String,
                    submitterId : ObjectId
                }
            ```
        -   Response:
            -   status 200 :
                -   message: 'Bug report successfully submitted'
            -   status 400 :
                -   message: 'Some error occurred. Please try again'
​
​
    -   /get-reports
        -   ***Special Interaction: This API endpoint is only called by the Administrator micro-service***
        -   HTTP Method: Get
        -   Description: Retrieves all reports from the bug-reports collection
        -   Permission needed: Admin user
        -   Parameters of request: None
        -   Response:
            -   status 200:
                - data :
                ```
                    {
                        reports: Array  // Array of bug reports, possibly empty
                    }
                ```
            -   status 400 :
                -   message: 'Some error occurred. Please try again' 
           
    -  /get-reports/:submitterId
        - HTTP Method: Get
        - Description: Retrieves all bug reports created by a specific user
        - Permission needed: Calling user must have the same Id as the one provided in the request parameters
        - Parameters of request: ID of submitter
        - Response:
            -   status 200:
                - data :
                ```
                    {
                        reports: Array  // Array of bug reports from the specified submitter, possibly empty
                    }
                ```
            -   status 400 :
                -   message: 'Some error occurred. Please try again' 
            
    -  /update-report
        - HTTP Method: POST
        - Description: Updates the description of a specific report from the bug-reports collection
        - Permission needed: Calling user must be owner of the bug report
        - Body of request:
            ```
                {
                    _id : ObjectId // Id of the report to update
                    newDescription: String // New description of the specified bug report
                }
            ```
        - Response:
            - status 200 :
                - message: 'Bug report successfully updated'
            - status 400 :
                - message: 'Some error occurred. Please try again'
​
    -  /delete-report
        - HTTP Method: POST
        - Description: Deletes a specific report from the bug-reports collection
        - Permission needed: Calling user must be owner of the bug report
        - Body of request:
            ```
                {
                    _id : ObjectId // Id of the report to delete
                }
            ```
        - Response:
            - status 200 :
                - message: 'Bug report successfully deleted'
            - status 400 :
                - message: 'Some error occurred. Please try again'