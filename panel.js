  // suffix displaying 3DS support
  const THREE_DS_SUFFIX = " (3DS)";

  let cards = [];
  let giftcards = [];
  let ibans = [];

  $("#search").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".cardnumbers").each(function(i, card) {
      $(card).toggle($(card).text().toLowerCase().indexOf(value) > -1)
    });
    
});

// load content of the panel
async function load() {

  cards = await getFromStorage("cards");

  if(cards == undefined) {
    // first time: load from json file
    cards = await loadFromFile("data/cards.json");
    await setInStorage("cards", cards);
  }

  giftcards = await getFromStorage("giftcards");

  if(giftcards == undefined) {
    // first time: load from json file
    giftcards = await loadFromFile("data/giftcards.json");
    await setInStorage("giftcards", giftcards);
  }

  ibans = await getFromStorage("ibans");

  if(ibans == undefined) {
    // first time: load from json file
    ibans = await loadFromFile("data/ibans.json");
    await setInStorage("ibans", ibans);
  }

  var outerdiv = $('<div>');

  // favourites section
  outerdiv.append(createFavourites());
  // cards section
  outerdiv.append(createCards());
  // giftcards section
  outerdiv.append(createGiftCards());
  // ibans section
  outerdiv.append(createIbans());

  $('#cards').html(outerdiv);
}

// render cards section
function createCards() {

  var divs = []

  // all cards section
  $.each(cards , function(index, item) { 

    var div = $('<div>').addClass("cardnumbers");
    var h3 = $('<h3>').addClass("sectionTitle").text(item.group);
    
    const cards = createCardsBrandSection(item.items);
    if(cards != undefined) {
      // show section when not empty (i.e. all cards are in the favourites section)
      div.append(h3);
      div.append(cards);

      divs.push(div);
    }
  });

  return divs;
}

// render favourites section
// find favourites in cards, giftcards, ibans lists
function createFavourites() {

  var divFavourites = $('<div>').addClass("cardnumbers");
  var h3 = $('<h3>').addClass("sectionTitle").text("Favourites");
  divFavourites.append(h3);

  let numFavs = 0;

  // find favourite cards
  var table = $('<table>');
  $.each(cards , function(index, item) { 

    const logo = item.logo;

    $.each(item.items , function(index, item) { 

      if(item.favourite) {
        numFavs++;

        var row = $('<tr>');
        var tdIcon = ($('<td>').append(makeCardUnfavIcon(item.cardnumber)));
        if(item.secure3DS) {
          // add suffix when card flow supports 3DS ie 3714 4963 5398 431 (3DS)
          var tdNumber = ($('<td>').addClass("tdCardNumber").text(item.cardnumber + THREE_DS_SUFFIX));
        } else {
          var tdNumber = ($('<td>').addClass("tdCardNumber").text(item.cardnumber));
        }
        // add as hidden (not visible but be able to get the value when prefilling card component)
        var tdExpiry = ($('<td>').addClass("hidden").addClass("tdExpiry").text(item.expiry));
        // add as hidden (not visible but be able to get the value when prefilling card component)
        var tdCode = ($('<td>').addClass("hidden").addClass("tdCode").text(item.CVC));
        var tdLogo = ($('<td>').addClass("center").addClass(logo));
        var tdLinks = ($('<td>').addClass("center").append(createLinks("card")));
        row.append(tdIcon).append(tdNumber).append(tdExpiry).append(tdCode).append(tdLogo).append(tdLinks);
        table.append(row);
      }
      divFavourites.append(table);
    })
  });

  // find favourite giftcards
  $.each(giftcards, function (index, item) {
    if (item.favourite) {
      numFavs++;

      var row = $('<tr>');
      var tdIcon = ($('<td>').append(makeGiftCardUnfavIcon(item.cardnumber)));
      var tdNumber = ($('<td>').addClass("tdCardNumber").text(item.cardnumber));
        // add as hidden (not visible but be able to get the value when prefilling card component)
        var tdCode = ($('<td>').addClass("hidden").addClass("tdCode").text(item.code));
      var tdLogo = ($('<td>').addClass("center").text("Gift Card"));
      var tdLinks = ($('<td>').addClass("center").append(createLinks("giftcard")));
      row.append(tdIcon).append(tdNumber).append(tdCode).append(tdLogo).append(tdLinks);
      table.append(row);
    }
    divFavourites.append(table);
  });

  // find favourite IBANs
  $.each(ibans, function (index, item) {
    if (item.favourite) {
      numFavs++;

      var row = $('<tr>');
      var tdIcon = ($('<td>').append(makeIbanUnfavIcon(item.iban)));
      var tdNumber = ($('<td>').addClass("tdCardNumber").text(item.iban));
        // add as hidden (not visible but be able to get the value when prefilling card component)
        var tdCode = ($('<td>').addClass("hidden").addClass("tdExpiry").text(item.name));  // note: use expiry column for IBAN account holder
      var tdLogo = ($('<td>').addClass("center").text("IBAN"));
      var tdLinks = ($('<td>').addClass("center").append(createLinks("iban")));
      row.append(tdIcon).append(tdNumber).append(tdCode).append(tdLogo).append(tdLinks);
      table.append(row);
    }
    divFavourites.append(table);
  });

  if(numFavs == 0) {
    // empty section
    var text = $('<em>').text("Add favourites if you like :-)");
    divFavourites.append(text);
  }

  return divFavourites;
}

// add card to favourites
function makeCardFav(cardnumber) {

  // find card number and mark as fav
  for (let i = 0; i < cards.length; i++) {
    let items = cards[i].items;

    for (let j = 0; j < items.length; j++) {
      let item = items[j];
      if(item.cardnumber === cardnumber) {
        item.favourite = true;  
        }
    }
  }

  // save to storage and reload
  setInStorage("cards", cards);
  load();
}

// remove card from favourites
function makeCardUnfav(cardnumber) {

  // find card number and mark as not fav  
  for (let i = 0; i < cards.length; i++) {
    let items = cards[i].items;

    for (let j = 0; j < items.length; j++) {
      let item = items[j];
      if(item.cardnumber === cardnumber) {
        item.favourite = false;  
        }
    }
  }

  // save to storage and reload
  setInStorage("cards", cards);
  load();
}

// add giftcard to favourites
function makeGiftCardFav(cardnumber) {

  // find giftcard number and mark as fav
  for (let j = 0; j < giftcards.length; j++) {
    let item = giftcards[j];
    if(item.cardnumber === cardnumber) {
      item.favourite = true;  
      }
  }

  // save to storage and reload
  setInStorage("giftcards", giftcards);
  load();
}

// remove giftcard from favourites
function makeGiftCardUnfav(cardnumber) {

  // find giftcard number and mark as not fav
  for (let j = 0; j < giftcards.length; j++) {
    let item = giftcards[j];
    if(item.cardnumber === cardnumber) {
      item.favourite = false;  
      }
  }

  // save to storage and reload
  setInStorage("giftcards", giftcards);
  load();
}

// add IBAN to favourites
function makeIbanFav(iban) {

  // find IBAN number and mark as fav
  for (let j = 0; j < ibans.length; j++) {
    let item = ibans[j];
    if(item.iban === iban) {
      item.favourite = true;  
      }
  }

  // save to storage and reload
  setInStorage("ibans", ibans);
  load();
}

// removed IBAN from favourites
function makeIbanUnfav(iban) {

  // find IBAN number and mark as not fav
  for (let j = 0; j < ibans.length; j++) {
    let item = ibans[j];
    if(item.iban === iban) {
      item.favourite = false;  
      }
  }

  // save to storage and reload
  setInStorage("ibans", ibans);
  load();
}

// render brand of cards
function createCardsBrandSection(cards) {

  let numCards = 0;

  var table = $('<table>');
  $.each(cards , function(index, item) { 

    if(!item.favourite) {
      numCards++;

      var row = $('<tr>');
      var td0 = ($('<td>').append(makeCardFavIcon(item.cardnumber)));
      if(item.secure3DS) {
        // add suffix when card flow supports 3DS ie 3714 4963 5398 431 (3DS)
        var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber + THREE_DS_SUFFIX));
      } else {
        var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber));
      }
      var td2 = ($('<td>').addClass("center").addClass("tdExpiry").text(item.expiry));
      var td3 = ($('<td>').addClass("center").addClass("tdCode").text(item.CVC));
      var td4 = ($('<td>').addClass("center").append(createLinks()));
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

// render giftcards
function createGiftCards() {

  var divGiftCards = $('<div>').addClass("cardnumbers");
  var h3 = $('<h3>').addClass("sectionTitle").text("Gift cards");
  divGiftCards.append(h3);

  let numCards = 0;

  var table = $('<table>');
  $.each(giftcards , function(index, item) { 

    if(!item.favourite) {
      numCards++;

      var row = $('<tr>');
      var td0 = ($('<td>').append(makeGiftCardFavIcon(item.cardnumber)));
      var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber));
      var td2 = ($('<td>').addClass("tdType").text(item.type));
      var td3 = ($('<td>').addClass("center").addClass("tdCode").text(item.code));
      var td4 = ($('<td>').addClass("center").append(createLinks()));
      row.append(td0).append(td1).append(td2).append(td3).append(td4);
      table.append(row); 
    }
  });
  divGiftCards.append(table);

  if(numCards > 0) {
    return divGiftCards;
  } else {
    return undefined;
  }
}

// render ibans
function createIbans() {

  var divIbans = $('<div>').addClass("cardnumbers");
  var h3 = $('<h3>').addClass("sectionTitle").text("IBANs");
  divIbans.append(h3);

  let numCards = 0;

  var table = $('<table>');
  $.each(ibans , function(index, item) { 

    if(!item.favourite) {
      numCards++;

      var row = $('<tr>');
      var td0 = ($('<td>').append(makeIbanFavIcon(item.iban)));
      var td1 = ($('<td>').addClass("tdCardNumber").text(item.iban));
      var td2 = ($('<td>').addClass("tdExpiry").text(item.name));  // note: use expiry column for IBAN account holder
      var td3 = ($('<td>').addClass("center").append(createLinks()));
      row.append(td0).append(td1).append(td2).append(td3);
      table.append(row); 
    }
  });
  divIbans.append(table);

  if(numCards > 0) {
    return divIbans;
  } else {
    return undefined;
  }
}

// icon to add card in favourites
function makeCardFavIcon(cardnumber) {
  var div = $('<div>').addClass("fav-icon");

  div.on('click', function() {
    makeCardFav(cardnumber);
  });
  
  return div;
}

// icon to remove card from favourites
function makeCardUnfavIcon(cardnumber) {
  var div = $('<div>').addClass("unfav-icon");

  div.on('click', function() {
    makeCardUnfav(cardnumber);
  });
  
  return div;
}

// icon to add giftcard in favourites
function makeGiftCardFavIcon(cardnumber) {
  var div = $('<div>').addClass("fav-icon");

  div.on('click', function() {
    makeGiftCardFav(cardnumber);
  });
  
  return div;
}

// icon to remove giftcard from favourites
function makeGiftCardUnfavIcon(cardnumber) {
  var div = $('<div>').addClass("unfav-icon");

  div.on('click', function() {
    makeGiftCardUnfav(cardnumber);
  });
  
  return div;
}

// icon to add IBAN in favourites
function makeIbanFavIcon(iban) {
  var div = $('<div>').addClass("fav-icon");

  div.on('click', function() {
    makeIbanFav(iban);
  });
  
  return div;
}

// icon to remove IBAN from favourites
function makeIbanUnfavIcon(iban) {
  var div = $('<div>').addClass("unfav-icon");

  div.on('click', function() {
    makeIbanUnfav(iban);
  });
  
  return div;
}

// create action links (copy, prefill)
function createLinks() {
  return $('<div>').addClass("actionLinks").append(createCopyLink()).append("&nbsp;&nbsp;&nbsp;").append(createPrefillLink());
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
  console.log("prefillCardComponent");

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
    if(codeTd === "ANY") {
      // replace ANY placeholder with valid code
      codeTd = "123";
    }
    if(codeTd === "None") {
      // replace None placeholder with empty code
      codeTd = "";
    }
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
  if(expiryMonth != null) { 
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

  // prefill IBAN
  var ibanNumber = document.querySelector('input[name^="ibanNumber"]');
  if(ibanNumber != null) {
    ibanNumber.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, cardNumberTd);
  }

  // prefill IBAN holder name
  var name = document.querySelector('input[name^="ownerName"]');
  if(name != null) {
    name.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, expiryTd);
  }
  
}

// save cards in local storage
async function setInStorage(name, value) {
  await chrome.storage.local.set( {[name]: value});
}

// get cards from local storage
async function getFromStorage(name) {
  let cards = await chrome.storage.local.get([name]); 

  return cards[name];
}

// load from json file
async function loadFromFile(filename) {
  console.log("loadFromFile " + filename);
  const res = await fetch(chrome.runtime.getURL(filename));
  const obj = await res.json()
  return obj;
}


document.addEventListener('DOMContentLoaded', function () {
  load();
});

