document.addEventListener("DOMContentLoaded", function () {
  const classificationList = document.querySelector("#classificationList");
  const inventoryDisplay = document.getElementById("inventoryDisplay");

  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);

    inventoryDisplay.innerHTML = '<p>Loading inventory...</p>';

    fetch(`/inv/getInventory/${classification_id}`)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error("Network response was not OK");
      })
      .then(data => {
        console.log(data);
        buildInventoryList(data);
      })
      .catch(error => {
        console.log('There was a problem: ', error.message);
        inventoryDisplay.innerHTML = `<p class="error">Error loading inventory: ${error.message}</p>`;
      });
  });

  function buildInventoryList(data) {
    if (data.length === 0) {
      inventoryDisplay.innerHTML = '<p>No inventory items found for this classification.</p>';
      return;
    }

    let dataTable = '<table>';
    dataTable += '<thead><tr><th>Vehicle Name</th><th>Modify</th><th>Delete</th></tr></thead>';
    dataTable += '<tbody>';

    data.forEach(element => {
      console.log(`${element.inv_id}, ${element.inv_model}`);
      dataTable += `<tr>
        <td>${element.inv_make} ${element.inv_model}</td>
        <td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>
        <td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>
      </tr>`;
    });

    dataTable += '</tbody></table>';
    inventoryDisplay.innerHTML = dataTable;
  }
});
