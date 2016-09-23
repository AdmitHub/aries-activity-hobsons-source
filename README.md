![alt text](/img/logo.png "Aries Integration for Hobsons")

# Aries Integration for Hobsons

This is an integration for [Hobsons](https://www.hobsons.com/). Transform a query from the Hobsons Connect API into a newline delimited JSON file in Amazon S3.

## Methods
This integration uses 5 callable methods. Currently, by default, `getFilterContactsByFilterId` is called.

### Get All Attributes
`getAllAttributes` - Returns array of JSON objects with with each object describing the attribute type, name, etc.

### Get All Filters
`getAllFilters` - Returns a list of all filters to use on query's.

### Get Filter Contacts By Filter ID
`getFilterContactsByFilterId` - Returns a list of contacts filtered out by the specified filter ID.

### Get Contact Count
`getContactCount` - Returns the number of contacts for the specified client.

### Get All Contacts
`getAllContacts` - Returns the list of all contacts for the specified client.

## Configuration

You can specify any of the following parameters in your Aries dashboard.

### URL
This is the url to your wsdl file. It will look like: 
https://services01.askadmissions.net/ws/bridge.asmx?wsdl 
The exact address is different for every client and is provided to you by your Hobsons account manager.
```javascript
"url": "https://services01.askadmissions.net/ws/bridge.asmx?wsdl"
```

### Client Name
Your Hobsons account name, such as 'astronomer'
```javascript
"clientName": "astronomer"
```

### Pass Key
Your API web service passkey. You can find this in your Hobsons Connect dashboard.
```javascript
"passKey": "J7EN4JaQPGLVuxQYvuvwMVq0HsW6DMPBno6TpMrgosl="

### Filter ID *optional*
The id for the filter from which you are querying. Specify this parameter when using the getFilterContactsByFilterId method.
```javascript
"filterId": 70542
```

### Attributes
The array of contact attributes you would like to be retrieved from the API. The following configuration would retrieve the 'Student Id', 'Date of Birth', and 'E-mail' attributes for any contacts you query.
```javascript
{ mappingName: 'Student Id', name: '' },
{ mappingName: 'Date of Birth', name: '' },
{ mappingName: 'E-mail', name: '' },
```

##Response
This is an example response with the default method `
```javascript
[
  {
    "attributes": [
      {
        "name": "test_name",
        "value": "",
        "mappingName": "Intent Received Date"
      },
      {
        "name": "test_name_2",
        "value": "001234567",
        "mappingName": "Panther ID"
      },
      {
        "name": "test_text",
        "value": "Accept: Will Not Attend",
        "mappingName": "Student Status"
      }
    ]
  },
  {
    "attributes": [
      {
        "name": "test_name",
        "value": "",
        "mappingName": "Intent Received Date"
      },
      {
        "name": "other_test_name",
        "value": "001234568",
        "mappingName": "Panther ID"
      },
      {
        "name": "test_text",
        "value": "Accept: Will Not Attend",
        "mappingName": "Student Status"
      }
    ]
  }
]
```

## License

MIT
