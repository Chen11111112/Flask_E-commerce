// static/script.js

// --- 應用程式狀態 (對應 React Hooks 的 useState) ---
let products = [];
let cartItems = [];
let productsLoading = true;
let error = null;
let searchTerm = '';
let types = ['All'];
let selectedType = 'All';

const BASE_URL = 'http://127.0.0.1:5000/practice/api/products'; // 連接 Flask 後端

// --- DOM 元素快取 ---
const $errorMsg = document.getElementById('error-message');
const $productsGrid = document.getElementById('products-grid');
const $typeFilters = document.getElementById('type-filters');
const $searchInput = document.getElementById('search-input');
const $cartItemsDiv = document.getElementById('cart-items');
const $cartTotalDiv = document.getElementById('cart-total');
const $btnCheckout = document.getElementById('btn-checkout');
const $cartEmptyMsg = document.getElementById('cart-empty');
const $Email = document.getElementById('ipt-email'); // 如果在這裡拿value會導致渲染時就拿到空值


// --- 核心邏輯 (對應 React 函式) ---

// 1. 渲染錯誤訊息
function renderError() {
    if (error) {
        $errorMsg.style.display = 'block';
        $errorMsg.textContent = error;
    } else {
        $errorMsg.style.display = 'none';
    }
}

// 2. 渲染商品類型篩選按鈕
function renderTypeFilters() {
    $typeFilters.innerHTML = '';
    types.forEach(type => {
        const button = document.createElement('button');
        button.className = `btn-type ${selectedType === type ? 'active' : ''}`;
        button.textContent = type === 'All' ? '全部商品' : type;
        button.onclick = () => {
            selectedType = type;
            renderAll(); // 重新渲染商品列表
        };
        $typeFilters.appendChild(button);
    });
}

// 3. 渲染商品列表
function renderProductList() {
    $productsGrid.innerHTML = ''; // 清空現有內容

    if (productsLoading) {
        $productsGrid.innerHTML = '<div class="loading"><p>載入商品中...</p></div>';
        return;
    }

    const filteredProducts = products.filter((product) => {
        const matchesSearchTerm = product.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'All' || product.category === selectedType;
        return matchesSearchTerm && matchesType;
    });

    if (filteredProducts.length === 0) {
        $productsGrid.innerHTML = '<p>沒有找到符合條件的商品。</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        priced = product.price
        card.innerHTML = `
            <h3>${product.title}</h3>
            <p class="product-type">類型: ${product.category}</p>
            <p class="price">$${Number(priced)}</p>
            <div class="actions">
                <input
                    type="number"
                    min="1"
                    value="1"
                    id="quantity_${product.id}"
                    class="quantity"
                />
                <button data-product-id="${product.id}" class="btn-add">加入購物車</button>
            </div>
        `;
        $productsGrid.appendChild(card);
    });

    // 重新綁定「加入購物車」按鈕的事件
    $productsGrid.querySelectorAll('.btn-add').forEach(button => {
        button.onclick = handleAddOrUpdateCartItem;
    });
}

// 4. 渲染購物車
function renderShoppingCart() {
    $cartItemsDiv.innerHTML = '';
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cartItems.length === 0) {
        $cartItemsDiv.innerHTML = '購物車是空的';
        $cartEmptyMsg.style.display = 'block';
        $cartTotalDiv.innerHTML = '';
        $btnCheckout.disabled = true;
        return;
    }
    
    $cartEmptyMsg.style.display = 'none';
    
    cartItems.forEach(item => {
        
        const itemDiv = document.createElement('div');
        priced = item.price
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="item-info">
                <h4>${item.title}</h4>
                <p>單價: $${Number(priced).toFixed(2)}</p>
                <p>數量: ${item.quantity}</p>
                <p class="subtotal">小計: ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button data-id="${item.id}" class="btn-delete">刪除</button>
        `;
        $cartItemsDiv.appendChild(itemDiv);
        
    });
    
    $cartTotalDiv.innerHTML = `<h3>總計: $${total.toFixed(2)}</h3>`;
    $btnCheckout.disabled = false;
    

    // 重新綁定「刪除」按鈕的事件
    $cartItemsDiv.querySelectorAll('.btn-delete').forEach(button => {
        button.onclick = handleDeleteCartItem;
    });
}

// 5. 統一渲染入口
function renderAll() {
    renderError();
    renderTypeFilters();
    renderProductList();
    renderShoppingCart();
}


// --- API 函式 (對應 ProductAPI) ---

// A. GET ALL 商品 (對應 useEffect)
async function fetchProducts() {
    productsLoading = true;
    renderProductList(); // 顯示 loading 狀態
    
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('API 回應錯誤');
        
        const data = await response.json();
        products = data;

        const allTypes = data.map(p => p.category);
        types = ['All', ...Array.from(new Set(allTypes))];
        error = null;

    } catch (err) {
        error = '❌ 無法載入商品資料。';
    } finally {
        productsLoading = false;
        renderAll();
    }
}

// B. DELETE 刪除購物車項目
async function handleDeleteCartItem(event) {
    const idToDelete = parseInt(event.target.dataset.id);

    try {
        // 1. 模擬 API 呼叫
        const response = await fetch(`${BASE_URL}/${idToDelete}`, { method: 'DELETE' });
        if (!response.ok) throw new Error("API 回應錯誤");

        // 2. 更新本地狀態
        cartItems = cartItems.filter(item => item.id !== idToDelete);
        alert("刪除成功！");
        error = null;
        renderShoppingCart();
    } catch (err) {
        error = "❌ 刪除失敗，請稍後再試！";
        renderError();
    }
}

// C. 加入購物車 (對應 handleAddOrUpdateCartItem)
function handleAddOrUpdateCartItem(event) {
    const productId = parseInt(event.target.dataset.productId);
    const quantityInput = document.getElementById(`quantity_${productId}`);
    let quantity = parseInt(quantityInput.value);
    
    if (isNaN(quantity) || quantity < 1) {
        alert("請輸入有效的數量 (至少為 1)");
        quantityInput.value = 1;
        return;
    }

    const productToAdd = products.find(p => p.id === productId);
    if (!productToAdd) return;

    const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
        // 更新現有項目
        cartItems[existingItemIndex].quantity += quantity;
    } else {
        // 建立新項目 (使用 product id 作為 CartItem 的 id，雖然不太嚴謹但模仿了原程式邏輯)
        const newCartItem = {
            id: productToAdd.id, // 這裡的 id 是 product id
            productId: productToAdd.id,
            title: productToAdd.title,
            price: productToAdd.price,
            quantity: quantity,
        };
        cartItems.push(newCartItem);
    }
    
    alert(`已將 ${quantity} 個 ${productToAdd.title} 加入購物車！`);
    renderShoppingCart(); // 重新渲染購物車

    // 重設數量輸入框為 1
    quantityInput.value = 1; 
}


// D. POST 結帳 (對應 onCheckoutSubmit)
async function handleCheckoutSubmit() {
    if (cartItems.length === 0) return;

    try {
        // 1. 建立 FormData 物件 (對應原程式碼的 FormData 建立)
        const formData = new FormData();
        
        cartItems.forEach((item, index) => {
            formData.append(`productId_${index}`, String(item.productId));
            formData.append(`quantity_${index}`, String(item.quantity));
            formData.append(`title_${index}`, item.title);
            formData.append(`price_${index}`, String(item.price));
        });
        formData.append("total_items", String(cartItems.length));
        formData.append("user_email",$Email.value); // 這裡才拿value

        console.log($Email);
        
        // 2. 呼叫 API
        const response = await fetch(`${BASE_URL}/checkout`, {
            method: 'POST',
            body: formData, // fetch 會自動設定 Content-Type: multipart/form-data
        });
        
        if (!response.ok) throw new Error("結帳失敗，請檢查網路！");
        
        const result = await response.json();

        // 3. 處理成功：清空購物車，顯示訊息
        alert(`結帳成功！訂單編號：${result.orderNo}，請檢察信箱。`);
        cartItems = [];
        error = null;
        renderAll();
        
    } catch (err) {
        error = "❌ 結帳失敗，請聯繫客服！";
        console.log(err)
        renderError();
    }
}


// --- 事件監聽 (對應 React 的 onChange) ---
$searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderProductList(); // 只需要重新渲染列表
});

$btnCheckout.addEventListener('click', handleCheckoutSubmit);

// --- 應用程式初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});
