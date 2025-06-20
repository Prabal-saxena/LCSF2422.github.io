const API_PRODUCT_URL = 'http://localhost:8081/api/products';
async function fetchData() { // fetchData("http://localhost:8081/api/product", "productDetails");
    try {
        const response = await fetch('http://localhost:8081/api/product'); // Replace with your server's URL and endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Assuming your server sends JSON data
        displayData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        const figureElement = document.getElementById('productDetails'); // Use the ID of your <figure>
        figureElement.innerHTML = '<p>Failed to load product data. Please try again later.</p>';
    }
}

function displayData(data) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) {
        console.error('Error: Products container element not found.');
        return;
    }

    productsContainer.innerHTML = ''; // Clear existing content before adding new products

    data.forEach (product => {
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

// Call the fetchData function when the page loads
window.onload = fetchData;