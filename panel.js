  // suffix displaying 3DS support
  const THREE_DS_SUFFIX = " (3DS)";

  $("#search").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".cardnumbers").each(function(i, card) {
      console.log(card);
      $(card).toggle($(card).text().toLowerCase().indexOf(value) > -1)
    });
    
});

async function load() {

  const res = await fetch(chrome.runtime.getURL('data.json'));
  const obj = await res.json()
  $('#cards').append(listCards(obj));
}

function listCards(data) {
  var outerdiv = $('<div>');

  $.each(data , function(index, item) { 
    var div = $('<div>').addClass("cardnumbers");
    var h3 = $('<h3>').addClass("sectionTitle").text(item.group);
    div.append(h3);
    div.append(createTable(item.cards));
    outerdiv.append(div);
  });

  return outerdiv;
}

function createTable(cards) {
  var table = $('<table>');
  $.each(cards , function(index, item) { 
    var row = $('<tr>');
    if(item.secure3DS) {
      // add suffix when card flow supports 3DS ie 3714 4963 5398 431 (3DS)
      var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber + THREE_DS_SUFFIX));
    } else {
      var td1 = ($('<td>').addClass("tdCardNumber").text(item.cardnumber));
    }
    var td2 = ($('<td>').addClass("tdExpiry").text(item.expiry));
    var td3 = ($('<td>').addClass("tdCode").text(item.CVC));
    var td4 = ($('<td>').append(createLinks()));
    row.append(td1).append(td2).append(td3).append(td4);
    table.append(row); 
  });

  return table;
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
  
}


document.addEventListener('DOMContentLoaded', function () {
  load();
});

