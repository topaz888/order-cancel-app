document.addEventListener("DOMContentLoaded",function(){
  const order = document.querySelectorAll("ordereditor")
  if(!order) return;
  oe_checkStatus(order);
})

function autoAddbutton(order, items_status) {
  const table = document.querySelector('table.order-details');
  if(table == null) return;
  const thead = table.querySelector('thead');
  if(thead != null) {
    let tr = thead.querySelector('tr');
    let th = document.createElement('th');
    tr?.appendChild(th);
  }
  const line_items = items_status.line_items

  const tbody = table.querySelector('tbody');
    if(tbody != null) {
        let rows = tbody.querySelectorAll('tr');
        rows.forEach(function(row, index){
            let td = document.createElement("td");
            let div = document.createElement("div");
            div.classList.add("oe-d-flex");
            let button = document.createElement("button");
            button.classList.add("oe-button","oe-cancel-active");
            if(line_items[index].unfulfillable_quantity){
              button.innerHTML = "Cancel";
              button.addEventListener("click",function(e){
                oe_showCancelModal(this.getAttribute("data-order-number"),this.getAttribute("data-order-item"));
            });
            }
            else{
              button.innerHTML = "Cancelled";
              button.disabled = true;
            }
            button.setAttribute("data-order-number",order[index].getAttribute('data-order-number')||0);
            button.setAttribute("data-order-item",order[index].getAttribute('data-order-item')||0);
            div.appendChild(button);
            td.appendChild(div);
            row.appendChild(td);
        })
    }
}

function oe_showCancelModal(order_id, item_id) {
  let modal = document.createElement('div');
  modal.setAttribute('id','oe-cancel-modal');
  modal.classList.add('oe-modal-outer');
 
  modal.innerHTML = `
      <div class="oe-modal">
          <div class="oe-modal-header">
              <h3 class="oe-modal-header-title">Cancel Confirmation</h3>
              <button class="oe-close oe-btn-cancel" onclick="oe_hideCancelModal()">
                  <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true"><path d="M13.97 15.03a.75.75 0 1 0 1.06-1.06l-3.97-3.97 3.97-3.97a.75.75 0 0 0-1.06-1.06l-3.97 3.97-3.97-3.97a.75.75 0 0 0-1.06 1.06l3.97 3.97-3.97 3.97a.75.75 0 1 0 1.06 1.06l3.97-3.97 3.97 3.97Z"></path></svg>
              </button>
          </div>
          <div class="oe-modal-body">
              <p>Are you sure you want to cancel the order?</p>

          </div>
          <div class="oe-modal-action">
              <button class="oe-btn oe-btn-plain oe-btn-cancel" onclick="oe_hideCancelModal()">Cancel</button>
              <button class="oe-btn" onclick="oe_handleCancelOrder(this,${order_id}, ${item_id})">Proceed</button>
          </div>
      </div>
  `;
  document.body.insertBefore(modal, document.body.firstChild);
}


function oe_hideCancelModal() {
  let modal = document.getElementById('oe-cancel-modal');
  if(modal != null) modal.parentNode?.removeChild(modal);
}

function oe_handleCancelOrder(btn,order_id, item_id) {
  if(btn.disabled) return;

  btn.disabled = true;
  btn.innerHTML = "Cancelled";

  let formData = new FormData();
  formData.append('orderId', order_id);
  formData.append('lineItemId', item_id);
  
  fetch('/apps/orders/api/order_cancel', {
      method: 'POST',
      body: formData
  })
  .then(function(response){
      if(!response.ok) throw new Error("Internal server error");
      return response.json();
  })
  .then(function(result){
      if(result.error) {
            btn.disabled = false;
            btn.innerHTML = "Proceed";
            throw "Failed to cancel order"     
      } else {
          oe_hideCancelModal();
          location.reload();
      }
  })
  .catch(function(error){
      alert(error);
      oe_hideCancelModal();
  });
}


function oe_checkStatus(order) {
  const order_id = order[0].getAttribute('data-order-number')||0
  fetch('/apps/orders/api/order_check?order='+order_id,{
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
.then(function(response){
    if(!response.ok) throw new Error("Internal server error");
    return response.json();
})
.then(function(result){
  console.log(result)
  autoAddbutton(order,result);
})
.catch(function(error){
    alert(error);
});
}