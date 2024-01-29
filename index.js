$(document).ready(function () {
    // Event handlers
    $('#toggleButton').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    $('#categoryImagesRow').on('click', '.meal', function () {
        const mealId = $(this).data('meal-id');
        displayMealDetails(mealId);
    });

    $('#backButton, #backButtonSearchModal').on('click', function () {
        console.log("Back button clicked");
        closeSearchModal();
    });

    // Function to close the modal
    function closeModal() {
        $('#mealDetailsModal').hide();
        $('#categoryImagesRow').show(); // Show the search results
    }

    // Toggle function to switch between meal details and search results
    function toggleView(showMealDetails) {
        if (showMealDetails) {
            $('#mealDetailsModal').show();
            $('#categoryImagesRow').hide(); // Hide the search results
        } else {
            closeModal();
        }
    }

    // Function to display meal details
    async function displayMealDetails(mealId) {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch meal details. Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.meals || !data.meals[0]) {
                throw new Error('Invalid data format. Expected meal details.');
            }

            const meal = data.meals[0];

            // Update the content of the modal
            const mealDetailsContent = $('#mealDetailsContent');
            mealDetailsContent.html(`
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${meal.strMealThumb}" class="w-100" alt="">
                        </div>
                        <div class="col-md-6">
                            <h2>${meal.strMeal}</h2>
                            <p>${meal.strInstructions}</p>
                            <button class="youtube"><a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a></button>
                            <button id="closeButton">Close</button>
                        </div>
                    </div>
                </div>
            `);

            // Attach event handler to the close button
            $('#closeButton').on('click', function () {
                toggleView(false);
            });

            // Show the modal
            toggleView(true);
        } catch (error) {
            console.error('Error fetching meal details:', error.message);
        }
    }

    // Function to display search results
    function displaySearchResults(meals) {
        const imagesRow = $('#categoryImagesRow');
        let cartoona = '';

        meals.forEach(meal => {
            cartoona += createMealCard(meal);
        });

        imagesRow.html(cartoona);
    }

    // Function to create a meal card HTML
    function createMealCard(meal) {
        return `
            <div class="col-md-3 p-2 overflow-hidden position-relative">
                <div class="card p-2 meal overflow-hidden" data-meal-id="${meal.idMeal}">
                    <img src="${meal.strMealThumb}" class="card-img-top w-100" alt="${meal.strMeal}">
                    <div class="meal-layer d-flex align-items-center text-black p-2 position-absolute">
                        <h5 class="card-title">${meal.strMeal}</h5>
                    </div>
                </div>
            </div>`;
    }

    // Function to fetch meals
    async function displayMeals() {
        const apiUrl = 'https://www.themealdb.com/api/json/v1/1/search.php?s';

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch. Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.meals || !Array.isArray(data.meals)) {
                throw new Error('Invalid data format. Expected an array of meals.');
            }

            // Display search results by default
            displaySearchResults(data.meals);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    }

    // Call the function to display meals with the default search term
    displayMeals();

    // Search functionality
    $('#searchForm').on('submit', async function (event) {
        event.preventDefault();

        const searchTerm = $('#searchInput').val().trim();

        if (searchTerm !== '') {
            try {
                const searchApiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`;

                const response = await fetch(searchApiUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch search results. Status: ${response.status}`);
                }

                const searchData = await response.json();

                if (!searchData.meals || searchData.meals.length === 0) {
                    throw new Error('No results found.');
                }

                // Display search results and hide meal details
                displaySearchResults(searchData.meals);
                toggleView(false);
            } catch (error) {
                console.error('Error searching meals:', error.message);
            }
        }
        // Remove the line below if it's not needed
        // displaySearchResults(searchTerm);
    });

    // Function to close the search modal
    function closeSearchModal() {
        console.log("Closing search modal");
        $('#searchModal').css('display', 'none');
    }

    // Event handler for search link
    $('#menu li a').on('click', openSearchModal);

    // Function to open the search modal
    function openSearchModal() {
        $('#searchModal').show();
    }

    // Function to display search results in a modal
    function displaySearchResultsModal(meals) {
        const searchResultsContent = $('#searchResultsContent');

        // Check if there's only one meal in the results
        if (meals.length === 1) {
            const meal = meals[0];
            displayMealDetails(meal.idMeal);
            closeSearchResultsModal(); // Close the search results modal after displaying meal details
            return;
        }

        const cartoona = meals.map(meal => createMealCard(meal)).join('');
        searchResultsContent.html(cartoona);

        // Event handler for clicking on a meal in the search results modal
        searchResultsContent.on('click', '.meal', function () {
            const mealId = $(this).data('meal-id');
            displayMealDetails(mealId);
            closeSearchResultsModal(); // Close the search results modal after displaying meal details
        });
    }

    // Event handler for closing the search modal
    $('#closeSearchModal').on('click', function () {
        closeSearchModal();
    });

    // Function to close the search results modal
    function closeSearchResultsModal() {
        $('#searchResultsModal').hide();
    }

    function openCategoriesModal() {
        // Close other modals
        closeSearchModal();
        closeSearchResultsModal();
        closeModal(); // Close meal details modal

        // Fetch categories data
        fetchCategories();
    }

    // Event handler for opening the categories modal
    $('#menu li a[href="#categories"]').on('click', openCategoriesModal);

    // Function to open the categories modal
    function openCategoriesModal() {
        $('#categoriesModal').show();
    }

    // Function to display categories in the modal
    function displayCategoriesModal(categories) {
        const categoriesContent = $('#categoriesContent');
        let categoriesHTML = '';

        categories.forEach(category => {
            categoriesHTML += `
                <div class="category-item" data-category="${category.strCategory}">
                    ${category.strCategory}
                </div>`;
        });

        categoriesContent.html(categoriesHTML);

        // Show the categories modal
        openCategoriesModal();
    }

    // Function to fetch categories
    async function fetchCategories() {
        const categoriesContent = $('#categoriesContent');

        try {
            // Show loading screen
            $(".inner-loading-screen").fadeIn(300);

            const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');

            if (!response.ok) {
                throw new Error(`Failed to fetch categories. Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.categories || !Array.isArray(data.categories)) {
                throw new Error('Invalid data format. Expected an array of categories.');
            }

            // Display categories in the modal
            displayCategoriesModal(data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error.message);
        } finally {
            // Hide loading screen
            $(".inner-loading-screen").fadeOut(300);
        }
    }

    // Event handler for clicking on a category item
    $(document).on('click', '.category-item', function () {
        const selectedCategory = $(this).data('category');
        console.log(`Selected category: ${selectedCategory}`);
        // Fetch and display meals for the selected category
        displayMealsByCategory(selectedCategory);
    });

    // Function to display meals by category
    async function displayMealsByCategory(category) {
        try {
            const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch meals for category. Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.meals || !Array.isArray(data.meals)) {
                throw new Error('Invalid data format. Expected an array of meals.');
            }

            // Display search results for the selected category
            displaySearchResults(data.meals);
            // Close categories modal
            closeCategoriesModal();
        } catch (error) {
            console.error('Error fetching meals by category:', error.message);
        }
    }

    // Function to close the categories modal
    function closeCategoriesModal() {
        $('#categoriesModal').hide();
    }

    // Event handler for closing the search results modal
    $('#closeSearchResultsModal').on('click', function () {
        closeSearchResultsModal();
    });

    // Function to fetch areas
    async function fetchAreas() {
        const areasContent = $('#areasContent');

        try {
            // Show loading screen
            $(".inner-loading-screen").fadeIn(300);

            const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');

            if (!response.ok) {
                throw new Error(`Failed to fetch areas. Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.meals || !Array.isArray(data.meals)) {
                const areas = data.meals;

                let areasHTML = '';

                areas.forEach(area => {
                    areasHTML += `
                        <div class="area-item" data-area="${area.strArea}">
                            ${area.strArea}
                        </div>`;
                });

                areasContent.html(areasHTML);

                // Show the areas modal
                openAreasModal();
            }
        } catch (error) {
            console.error('Error fetching areas:', error.message);
        } finally {
            // Hide loading screen
            $(".inner-loading-screen").fadeOut(300);
        }
    }

    // Function to open the areas modal
    function openAreasModal() {
        $('#areasModal').show();
    }

    // Event handler for opening the areas modal
    $('#menu li a[href="#areas"]').on('click', fetchAreas);

    // Event handler for clicking on an area item
    $(document).on('click', '.area-item', function () {
        const selectedArea = $(this).data('area');
        console.log(`Selected area: ${selectedArea}`);
        // Fetch and display meals for the selected area
        displayMealsByArea(selectedArea);
    });

    // Function to display meals by area
    async function displayMealsByArea(area) {
        try {
            const apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch meals for area. Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.meals || !Array.isArray(data.meals)) {
                throw new Error('Invalid data format. Expected an array of meals.');
            }

            // Display search results for the selected area
            displaySearchResults(data.meals);
            // Close areas modal
            closeAreasModal();
        } catch (error) {
            console.error('Error fetching meals by area:', error.message);
        }
    }

    // Function to close the areas modal
    function closeAreasModal() {
        $('#areasModal').hide();
    }

    // Event handler for closing the areas modal
    $('#closeAreasModal').on('click', function () {
        closeAreasModal();
    });
});
