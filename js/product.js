const API_PRODUCT_URL = 'http://localhost:8081/api/product';


const productsContainer = document.getElementById('productsContainer');
const paginationControls = document.getElementById('paginationControls');

const appState = {
    categoryId: '',
    subCategoryId: '',
    page: '',
    size: '',
    totalProducts: 0
};

async function fetchData() {
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '<p style="text-align: center; color: #555;">Loading products...</p>';
    paginationControls.innerHTML = '';

    let apiUrl = API_PRODUCT_URL;
    const params = new URLSearchParams();
        
    if (appState.categoryId) {
        params.append('category', appState.categoryId);
    }

    if (appState.subCategoryId) {
        params.append('subCategory', appState.subCategoryId);
    }

    // Add pagination parameters
    params.append('page', appState.page);
    params.append('size', appState.size);

    // Append query parameters if any
    if (params.toString()) {
        apiUrl += `?${params.toString()}`;
    }

    try {
        const response = await fetch(apiUrl); // Calling the product API

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Server sends the JSON data
        console.log('Fetched paginated data', data);

        if(data && Array.isArray(data.content) && data.content.length >0){
            appState.totalProducts = data.totalElements;
            appState.size = data.size;
            appState.page = data.number;
            displayProducts(data.content);
            setupPaginationControls();
            window.initializeNavbar();
        }
        else {
            productsContainer.innerHTML = '<p class="error-message">No products found or data format is incorrect.</p>';
            paginationControls.innerHTML = '';
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        productsContainer.innerHTML = `<p class="error-message">Failed to load products: ${error.message}. Please ensure your server is running and accessible at ${API_PRODUCT_URL}.</p>`;
        paginationControls.innerHTML = '';
    }
}

function displayProducts(products) {

    productsContainer.innerHTML = ''; // Clear existing content before adding new products

    products.forEach (product => {
        // Create the <figaure> element
        const figure = document.createElement('figuare');
        figure.className = 'frame'; // Apply styling class

        // Create the <a> element for the image link
        const anchor = document.createElement('a');
        anchor.href = product.imageUrl || '#'; // Use productPageUrl or a default '#'

        // Create the <img> element
        const image = document.createElement('img');
        image.className = 'productimage'; // Apply styling class
        image.src = product.imageUrl || 'https://placehold.co/200x200/cccccc/333333?text=No+Image'; // Fallback placeholder image
        image.alt = product.name || 'Product Image';

        // Append image to anchor
        anchor.appendChild(image);
        // Append anchor to figure
        figure.appendChild(anchor);

        // Create the <figcaption> element
        const figcaption = document.createElement('figcaption');
        figcaption.className = 'product-pic-text'; // Apply styling class

        let priceText = '';
        if (product.price !== undefined && product.price !== null) {
            priceText = `$${product.price.toFixed(2)}`; // Format price to two decimal places
        }
        figcaption.textContent = `${priceText} ${product.name || 'Unknown Product'}`;

        // Append figcaption to figure
        figure.appendChild(figcaption);

        // Create the "Add To Cart" button
        const addToCartButton = document.createElement('input');
        addToCartButton.type = 'submit';
        addToCartButton.value = 'Add To Cart';
        addToCartButton.className = 'addtocart';
        addToCartButton.style = 'grid-column: 2;'

        // Append button to figure
        figure.appendChild(addToCartButton);

        // Append the complete figure to the main container
        productsContainer.appendChild(figure);
    });
}

function setupPaginationControls(){
    paginationControls.innerHTML = '';

    const totalPages = Math.ceil(appState.totalProducts / appState.size);

    if (totalPages <= 1) {
        return; // No need for pagination if only one page
    }

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'pagination-button';
    prevButton.disabled = appState.page === 0;
    prevButton.addEventListener('click', () => {
        appState.page--;
        fetchData();
    });
    paginationControls.appendChild(prevButton);

    for (let i = 0; i < totalPages; i++){
        const pageButton = document.createElement('button');
        pageButton.textContent = i+1;
        pageButton.className = 'pagination-button';
        
        pageButton.classList.toggle('active', i === appState.page); // Highlight active page
        
        pageButton.addEventListener('click', () => {
            appState.page = i;
            fetchData();
        });
        paginationControls.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'pagination-button';
    nextButton.disabled = appState.page === totalPages - 1; // Disable if on the last page
    nextButton.addEventListener('click', () => {
        appState.page++;
        fetchData();
    });
    paginationControls.appendChild(nextButton);

}

// Initial load of all products when product.js is loaded (and DOM is ready)
document.addEventListener('DOMContentLoaded', () => {
    // Only fetch all products if we are on the product listing page
    // This is a simple check; you might use a more robust routing solution
    if (productsContainer) {
        fetchData(); // Call without filters to get all products initially
    }
});

// Call the fetchData function when the page loads
window.fetchData = fetchData;
window.appState = appState;