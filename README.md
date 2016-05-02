# aries-activity-hobsons-source

Transform a query from the Hobsons Connect API into a newline delimited JSON file in Amazon S3.

## Configuration

You can specify any of the following parameters in your Aries dashboard.

### url

This is the url to your wsdl file. It will look like: 
https://services01.askadmissions.net/ws/bridge.asmx?wsdl 
The exact address is different for every client and is provided to you by your Hobsons account manager.

### clientName

Your Hobsons account name, such as 'astronomer'

### passKey

Your API web service passkey. You can find this in your Hobsons Connect dashboard.

### filterId 
*optional*

The id for the filter from which you ar querying. Specify this parameter when using the getFilterContactsByFilterId method.

### attributes

The array of contact attributes you would like to be retrieved from the API. The following configuration would retrieve the 'Student Id', 'Date of Birth', and 'E-mail' attributes for any contacts you query.

Example:

``` javascript
{ mappingName: 'Student Id', name: '' },
{ mappingName: 'Date of Birth', name: '' },
{ mappingName: 'E-mail', name: '' },
```

## License

MIT
