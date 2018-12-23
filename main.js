//Insert key for Alpha Vantage
const API_KEY = 'AUZX1M739I8704IG';

//URLs for Alpha Vantage API
const searchStockAPI = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=';
const matchStockAPI = 'https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=';

//Reference to page items
const table = document.querySelector('#output');
const message = document.querySelector('#message');
const symbol = document.querySelector('#stockSymbol');

$(document).ready(function() {

    //Configure typeahead reference https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md#options
    $('#stockSymbol').typeahead({
        highlight: true,
        minLength: 1
    },
    {
        display: (suggestion) => {
            return suggestion.symbol},
        limit: 10,
        source: matchStock,
        templates: {
            suggestion: Handlebars.compile(
                '<div>{{symbol}}, {{name}}</div>'
            ),
            notFound: Handlebars.compile(
                'No Stock Found for {{query}}'
            ),
            pending: Handlebars.compile(
                'Loading Results for {{query}}...'
            ),
            footer: 'Please Choose a Stock ⬆'
        }
        
    });

    //Give search box focus on page load
    $('#stockSymbol').focus();

});

function searchStock() {

    const searchItems = [];

    //Clear out table and message for resubmit
    table.innerHTML = '';
    message.innerHTML = '';
    message.className = '';

    //Search stock from Alpha Vantage Quote Endpoint
    $.getJSON(`${searchStockAPI}${symbol.value}&apikey=${API_KEY}`, (data) => {

        //Handle API frequency error
        if (!data["Global Quote"]) {
            message.className = 'alert alert-danger';
            message.innerHTML = `${data.Note}`;
            return; //Skip rest of function if API frequency limit has been hit
        }

        //Table header
        searchItems.push(`<thead><th style="text-align:center" colspan="2">Stock Information for ${symbol.value}</th></thead>`);

        //Table Rows
        $.each(data["Global Quote"], ( key, val ) => {
            searchItems.push(`<tr><td>${key.substring(4)}</td><td>${val}</td></tr>`);
        });

        //Append to table
        table.innerHTML = searchItems.join('');          
        
    });
}

function matchStock(query, syncResults, asyncResults) {

    const matches = [];
    
    //Match stock from Alpha Vantage Search Endpoint
    $.getJSON(`${matchStockAPI}${query}&apikey=${API_KEY}`, (data) => {

        //Handle API frequency error
        if (!data["bestMatches"]) {
            message.className = 'alert alert-danger';
            message.innerHTML = `${data.Note}`;
            return; //Skip rest of function if API frequency limit has been hit
        }
        
        //Create JSON objects for each stock with properties of symbol and name
        $.each(data["bestMatches"], (key, val) => {
            matches.push({symbol: val["1. symbol"], name: val["2. name"]});
        });

        asyncResults(matches);
        
    });
};

//Search stock when user presses enter
$(document).keypress((event) => {
    const keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        searchStock.call();
    }
});

