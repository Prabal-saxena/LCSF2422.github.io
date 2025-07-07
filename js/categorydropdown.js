document.addEventListener('DOMContentLoaded', () => {
    const dropdownColumns = document.querySelector('.dropdown-columns');
    const loadingMessage = dropdownColumns ? dropdownColumns.querySelector('.loading-message') : null; // Check if dropdownColumns exists

    // *** IMPORTANT: Replace this with the actual URL of your Java API endpoint ***
    // Example: If your Java API runs on http://localhost:8080 and the endpoint is /api/categories
    const JAVA_API_CATEGORIES_URL = 'http://localhost:8081/api/categories';
    const API_PRODUCT_URL = 'http://localhost:8081/api/product';
    // If your frontend and backend are on the same domain/port, you might use a relative path:
    // const JAVA_API_CATEGORIES_URL = '/api/categories';

    const fetchCategories = async () => {
        if (!dropdownColumns) {
            console.warn("Dropdown content container not found. Navigation may not function correctly.");
            return []; // Return empty array if the container isn't there
        }

        if (loadingMessage) {
            loadingMessage.textContent = 'Loading categories...'; // Reset loading message
        }

        try {
            const response = await fetch(JAVA_API_CATEGORIES_URL);

            if (!response.ok) {
                // If the server responded with an error status (e.g., 404, 500)
                const errorText = await response.text(); // Try to get error message from server
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText || 'Unknown error'}`);
            }

            const categories = await response.json();
            return categories;
        } catch (error) {
            console.error("Could not fetch categories from Java API:", error);
            if (loadingMessage) {
                loadingMessage.textContent = 'Failed to load categories. Please try again.';
            }
            throw error; // Re-throw to be caught by the .catch in the main block
        }
    };

    const displayCategories = (categories) => {
        if (!dropdownColumns) return; // Exit if container not found

        dropdownColumns.innerHTML = ''; // Clear loading message or previous content

        if (categories.length === 0) {
            dropdownColumns.innerHTML = '<div class="loading-message">No categories found.</div>';
            return;
        }

        categories.forEach(category => {
            const categoryGroup = document.createElement('div');
            categoryGroup.classList.add('dropdown-category-group');

            // Category Title (e.g., Wine, Spirits)
            const categoryTitleLink = document.createElement('a');
            // Ensure your Java API returns a 'url' property for main categories
            categoryTitleLink.href = `${API_PRODUCT_URL}?category=${category.categoryId}` || '#';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category.category; // Ensure 'name' property exists
            categoryTitleLink.appendChild(categoryTitle);
            categoryGroup.appendChild(categoryTitleLink);
            
            categoryTitleLink.addEventListener('click', (event) => {
                event.preventDefault();

                if (window.appState && typeof window.fetchData === 'function'){
                    window.appState.categoryId = category.categoryId;
                    window.appState.subCategoryId = '';
                    window.appState.page = 0;
                    window.fetchData();
                    // closeDropdown();
                } else {
                    console.error("fetchData function not found on window.");
                    // Fallback to traditional link behavior if JS function isn't available
                    window.location.href = categoryTitleLink.href;
                }

            });

            if (category.subCategories && category.subCategories.length > 0) {
                const subcategoryList = document.createElement('ul');
                
                category.subCategories.forEach(subcategory => {
                    const listItem = document.createElement('li');
                    const subcategoryLink = document.createElement('a');
                    // Ensure your Java API returns 'url' and 'name' for subCategories
                    subcategoryLink.href = `${API_PRODUCT_URL}?category=${category.categoryId}&subCategory=${subcategory.subCategoryId}` || '#';
                    
                    const subCategoryTitle = document.createElement('h6');
                    subCategoryTitle.textContent = subcategory.subCategory;
                    subcategoryLink.appendChild(subCategoryTitle);
                    listItem.appendChild(subcategoryLink);
                    subcategoryList.appendChild(listItem);

                    subcategoryLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        if(window.appState && typeof window.fetchData === 'function'){
                            window.appState.categoryId = category.categoryId;
                            window.appState.subCategoryId = subcategory.subCategoryId;
                            window.appState.page = 0;
                            window.fetchData();
                        } else {
                            console.error("fetchData function not found on window.");
                            window.location.href = subcategoryLink.href;
                        }
                    });
                });
                categoryGroup.appendChild(subcategoryList);
            }
            dropdownColumns.appendChild(categoryGroup);
        });
    };

    // This function will be called once the DOM is fully loaded.
    // It will fetch and display categories on every page where script.js is included.
    const initializeNavbar = async () => {
        try {
            const categories = await fetchCategories();
            displayCategories(categories);
        } catch (error) {
            // Error already logged in fetchCategories, but can add more specific handling here if needed
        }
    };

    initializeNavbar(); // Execute on DOMContentLoaded
    window.initializeNavbar = initializeNavbar;
});
