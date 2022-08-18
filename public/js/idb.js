let db;
const request = indexedDB.open('budget_graph', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('money_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        completeTransaction(); 
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveTransaction(record) {
    const transaction = db.transaction(['money_transaction'], 'readwrite');

    const moneyObjectStore = transaction.objectStore('money_transaction');

    moneyObjectStore.add(record);
}

function completeTransaction() {
    const transaction = db.transaction(['money_transaction'], 'readwrite');
  
    const moneyObjectStore = transaction.objectStore('money_transaction');
  
    const getAll = moneyObjectStore.getAll();
  
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {

            fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }

            const transaction = db.transaction(['money_transaction'], 'readwrite');

            const moneyObjectStore = transaction.objectStore('money_transaction');

            moneyObjectStore.clear();
            alert('Transactions Saved!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

window.addEventListener("online", checkDatabase);