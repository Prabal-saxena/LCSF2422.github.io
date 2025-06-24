const API_PRODUCT_URL = 'http://localhost:8081/api/product';
let currentPage = 0;
const pageSize = 3;
let totalPages = 0;

const productsContainer = document.getElementById('productsContainer');
const paginationControls = document.getElementById('paginationControls');

async function fetchData(page, size) {
    productsContainer.innerHTML = '<p style="text-align: center; color: #555;">Loading products...</p>';
    paginationControls.innerHTML = '';

    try {
        const response = await fetch(`${API_PRODUCT_URL}?page=${page}&size=${size}`); // Replace with your server's URL and endpoint

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // { content: [...products...], totalPages: N, totalElements: M, number: current_page_number }
        const data = await response.json(); // Assuming your server sends JSON data
        console.log('Fetched paginated data', data);

        if(data && Array.isArray(data.content) && data.content.length >0){
            displayProducts(data.content);
            totalPages = data.totalPages;
            currentPage = data.number;
            setupPaginationControls(totalPages, currentPage);
        }
        else {
            productsContainer.innerHTML = '<p class="error-message">No products found or data format is incorrect.</p>';
            paginationControls.innerHTML = '';
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        productsContainer.innerHTML = `<p class="error-message">Failed to load products: ${error.message}. Please ensure your server is running and accessible at ${API_BASE_URL}.</p>`;
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

function setupPaginationControls(totalPages, currentPage){
    paginationControls.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'pagination-button';
    prevButton.disabled = currentPage === 0;
    prevButton.addEventListener('click', () => {
        fetchData(currentPage-1, pageSize);
    });
    paginationControls.appendChild(prevButton);

    const maxButton = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxButton / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxButton - 1);

    if(endPage - startPage + 1 < maxButton){
        startPage = Math.max(0, endPage - maxButton + 1);
    }

    for (let i = startPage; i <= endPage; i++){
        const pageButton = document.createElement('button');
        pageButton.textContent = i+1;
        pageButton.className = 'pagination-button';
        if (i === currentPage) {
            pageButton.classList.add('active'); // Highlight active page
        }
        pageButton.addEventListener('click', () => {
            fetchData(i, pageSize);
        });
        paginationControls.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'pagination-button';
    nextButton.disabled = currentPage >= totalPages - 1; // Disable if on the last page
    nextButton.addEventListener('click', () => {
        fetchData(currentPage + 1, pageSize);
    });
    paginationControls.appendChild(nextButton);
}

// Call the fetchData function when the page loads
window.onload = () => fetchData(currentPage, pageSize);