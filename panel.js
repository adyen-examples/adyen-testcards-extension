  // suffix displaying 3DS support
  const THREE_DS_SUFFIX = " (3DS)";
  // list of cards
  let list = [];

  $("#search").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".cardnumbers").each(function(i, card) {
      $(card).toggle($(card).text().toLowerCase().indexOf(value) > -1)
    });
    
});

// load content of the panel
async function load() {

  list = await getFromStorage();

  if(list == undefined) {
    // first time: load from json file
    list = await loadFromFile();
    await setInStorage(list);
  }

  $('#cards').html(listCards(list));
}

function listCards(data) {
  var outerdiv = $('<div>');

  // favourites section
  outerdiv.append(createFavourites(data));

  // all cards section
  $.each(data , function(index, item) { 

    const cards = createTable(item.cards);
    if(cards != undefined) {
      var div = $('<div>').addClass("cardnumbers");
      var h3 = $('<h3>').addClass("sectionTitle").text(item.group);
      div.append(h3);
  
      div.append(cards);
    }
    outerdiv.append(div);
  });

  return outerdiv;
}

// render favourites section
function createFavourites(cards) {

  var divFavourites = $('<div>').addClass("cardnumbers");
  var h3 = $('<h3>').addClass("sectionTitle").text("Favourites");
  divFavourites.append(h3);

  let numFavs = 0;

  var table = $('<table>');
  $.each(cards , function(index, item) { 
    $.each(item.cards , function(index, item) { 

      if(item.favourite) {
        numFavs++;

        var row = $('<tr>');
        var td0 = ($('<td>').append(getUnfavIcon(item.cardnumber)));
        if(item.secure3DS) {
          // add suffix when card flow supports 3DS ie 3714 4963 5398 431 (3DS)
          var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber + THREE_DS_SUFFIX));
        } else {
          var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber));
        }
        var td2 = ($('<td>').addClass("tdExpiry").text(item.expiry));
        var td3 = ($('<td>').addClass("tdCode").text(item.CVC));
        var td4 = ($('<td>').append(createLinks()));
        row.append(td0).append(td1).append(td2).append(td3).append(td4);
        table.append(row); 
      }
      divFavourites.append(table);
    })
  });

  if(numFavs == 0) {
    // empty section
    var text = $('<em>').text("Add favourites if you like :-)");
    divFavourites.append(text);
  }

  return divFavourites;
}

// add card to favourites
function makeFav(cardnumber) {

  for (let i = 0; i < list.length; i++) {
    let items = list[i].cards;

    for (let j = 0; j < items.length; j++) {
      let item = items[j];
      if(item.cardnumber === cardnumber) {
        item.favourite = true;  // mark as fav
        }
    }
  }

  // save to storage and reload
  setInStorage(list);
  load();
}

// add card to favourites
function makeUnfav(cardnumber) {

  for (let i = 0; i < list.length; i++) {
    let items = list[i].cards;

    for (let j = 0; j < items.length; j++) {
      let item = items[j];
      if(item.cardnumber === cardnumber) {
        item.favourite = false;  // mark as not fav
        }
    }
  }

  // save to storage and reload
  setInStorage(list);
  load();
}

// render brand of cards
function createTable(cards) {

  let numCards = 0;

  var table = $('<table>');
  $.each(cards , function(index, item) { 

    if(!item.favourite) {
      numCards++;

      var row = $('<tr>');
      var td0 = ($('<td>').append(getFavIcon(item.cardnumber)));
      if(item.secure3DS) {
        // add suffix when card flow supports 3DS ie 3714 4963 5398 431 (3DS)
        var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber + THREE_DS_SUFFIX));
      } else {
        var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber));
      }
      var td2 = ($('<td>').addClass("tdExpiry").text(item.expiry));
      var td3 = ($('<td>').addClass("tdCode").text(item.CVC));
      var td4 = ($('<td>').append(createLinks()));
      row.append(td0).append(td1).append(td2).append(td3).append(td4);
      table.append(row); 
    }
  });

  if(numCards > 0) {
    return table;
  } else {
    return undefined;
  }
}

// icon to add card in favourites
function getFavIcon(cardnumber) {
  var div = $('<div>').addClass("fav-icon");

  div.on('click', function() {
    makeFav(cardnumber);
  });
  
  return div;
}

// icon to remove card from favourites
function getUnfavIcon(cardnumber) {
  var div = $('<div>').addClass("unfav-icon");

  div.on('click', function() {
    makeUnfav(cardnumber);
  });
  
  return div;
}

// create action links (copy, prefill)
function createLinks() {
  return $('<span>').append(createCopyLink()).append("&nbsp;&nbsp;&nbsp;").append(createPrefillLink());
}

function createCopyLink() {
  const anchor = $('<a>');
  anchor.addClass("copyLinkClick");
  anchor.attr('href', "a");
  anchor.text("Copy");
  anchor
    .click(
      function (evt) {
        evt.preventDefault();
        var cardNumberTd = $(this).closest("tr").find("td.tdCardNumber"); 
        // remove suffix (if found)
        var value = cardNumberTd.text().replace(THREE_DS_SUFFIX, "")  
       
        copyToClipboard(value);
      }
    );

  return anchor
}

function createPrefillLink() {
  const anchor = $('<a>');
  anchor.addClass("copyPrefillClick");
  anchor.attr('href', "a");
  anchor.text("Prefill");
  anchor
    .click(
      async function (evt) {
        evt.preventDefault();
        var cardNumberTd = $(this).closest("tr").find("td.tdCardNumber");
        // remove suffix (if found)
        var cardNumberTdValue = cardNumberTd.text().replace(THREE_DS_SUFFIX, "")  
        var expiryTd = $(this).closest("tr").find("td.tdExpiry");   
        var codeTd = $(this).closest("tr").find("td.tdCode");   

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          var activeTab = tabs[0];
          // inject js script to be run inside the active tab
          // must be injected to be able to access/update DOM
          chrome.scripting.executeScript(
            {
              target: {tabId: activeTab.id, allFrames: true},
              func : prefillCardComponent,
              args : [ cardNumberTdValue, expiryTd.text(), codeTd.text() ]
            }
          )
          });
      }
    );
  return anchor
}

async function copyToClipboard(val) {
  await navigator.clipboard.writeText(val)
}

// find and prefill form input fields
function prefillCardComponent(cardNumberTd, expiryTd, codeTd) {

  var cardnumber = document.querySelector('input[id^="adyen-checkout-encryptedCardNumber-"]');

  if(cardnumber != null) {
    cardnumber.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, cardNumberTd);
  }

  var expiry = document.querySelector('input[id^="adyen-checkout-encryptedExpiryDate-"]');
  if(expiry != null) { 
    expiry.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, expiryTd);
  }

  var code = document.querySelector('input[id^="adyen-checkout-encryptedSecurityCode-"]');
  if(code != null) {
    code.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, codeTd);
  }

  var holder = document.querySelector('input[id^="adyen-checkout-holderName-"]');
  if(holder != null) {
    holder.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, "J. Smith");
  }

  // prefill expiryMonth (for custom card implementation)
  var expiryMonth = document.querySelector('input[id^="adyen-checkout-encryptedExpiryMonth-"]');
  console.log(expiryMonth);
  if(expiryMonth != null) { 
    console.log(expiryTd.slice(0, 2));
    expiryMonth.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, expiryTd.slice(0, 2));
  }

  // prefill expiryYear (for custom card implementation)
  var expiryYear = document.querySelector('input[id^="adyen-checkout-encryptedExpiryYear-"]');
  if(expiryYear != null) { 
    expiryYear.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, expiryTd.slice(-2));
  }
  
}

// save cards in local storage
async function setInStorage(cards) {
  await chrome.storage.local.set( {adyencards: cards});
}

// get cards from local storage
async function getFromStorage() {
  let cards = await chrome.storage.local.get(["adyencards"]); 

  return cards.adyencards;
}

// load cards from json file
async function loadFromFile() {
  console.log("loadFromFile data.json");
  const res = await fetch(chrome.runtime.getURL('data.json'));
  const obj = await res.json()
  return obj;
}


document.addEventListener('DOMContentLoaded', function () {
  load();
});

