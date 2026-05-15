const API_URL = "https://restcountries.com/v3.1";

let allCountries = [];

let comparisonList = [];



const searchInput = document.getElementById('searchInput');

const searchBtn = document.getElementById('searchBtn');

const countriesList = document.getElementById('countriesList');

const loader = document.getElementById('loader');

const errorMessage = document.getElementById('errorMessage');

const regionFilter = document.getElementById('regionFilter');

const sortSelect = document.getElementById('sortSelect');

const countryDetail = document.getElementById('countryDetail');

const comparisonSection = document.getElementById('comparisonSection');

const comparisonGrid = document.getElementById('comparisonGrid');

const compareInput = document.getElementById('compareInput');

const addCompareBtn = document.getElementById('addCompareBtn');



async function init() {

    try {

        showLoader(true);

        hideError();

        

        
        const fields = "name,translations,capital,region,population,flags,languages,currencies,borders,cca3";

        const response = await fetch(`${API_URL}/all?fields=${fields}`);

        

        if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);

        

        allCountries = await response.json();

        

        // Сортуємо за алфавітом

        allCountries.sort((a, b) => {

            const nameA = a.translations?.ukr?.common || a.name.common;

            const nameB = b.translations?.ukr?.common || b.name.common;

            return nameA.localeCompare(nameB);

        });



        renderCountries(allCountries.slice(0, 24)); 

        showLoader(false);

    } catch (err) {

        console.error("Деталі помилки:", err);

        showError("Не вдалося завантажити дані. Переконайтеся, що Live Server запущено.");

        showLoader(false);

    }

}



// 2. Пошук країни

async function searchCountry(name, isComparison = false) {

    if (!name.trim()) return;

    

    const query = name.trim().toLowerCase();

    hideError();



   
    const country = allCountries.find(c => {

        const ukrCommon = c.translations?.ukr?.common?.toLowerCase() || "";

        const engCommon = c.name.common.toLowerCase();

        return ukrCommon === query || engCommon === query || ukrCommon.includes(query);

    });



    if (!country) {

        showError(`Країну "${name}" не знайдено.`);

        return;

    }



    if (isComparison) {

        addToComparison(country);

    } else {

        renderDetail(country);

    }

}



// 3. Відображення деталей країни

function renderDetail(country) {

    countryDetail.classList.remove('hidden');

    comparisonSection.classList.remove('hidden');

    

    // Пошук назв сусідніх країн за їхніми кодами (cca3)

    const neighbors = country.borders 

        ? country.borders.map(code => {

            const neighbor = allCountries.find(c => c.cca3 === code);

            return neighbor ? (neighbor.translations?.ukr?.common || neighbor.name.common) : code;

          }).join(', ')

        : "Немає сусідів";



    countryDetail.innerHTML = `

        <div class="detail-card" style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 20px;">

            <div style="display: flex; gap: 25px; flex-wrap: wrap;">

                <img src="${country.flags.svg}" alt="Flag" style="width: 250px; border: 1px solid #ddd; border-radius: 4px;">

                <div>

                    <h2 style="margin-top:0">${country.translations?.ukr?.common || country.name.common}</h2>

                    <p><strong>Столиця:</strong> ${country.capital ? country.capital[0] : 'Н/Д'}</p>

                    <p><strong>Населення:</strong> ${country.population.toLocaleString()}</p>

                    <p><strong>Регіон:</strong> ${country.region}</p>

                    <p><strong>Валюта:</strong> ${Object.values(country.currencies || {}).map(c => c.name).join(', ')}</p>

                    <p><strong>Сусіди:</strong> ${neighbors}</p>

                </div>

            </div>

        </div>

    `;

    

        if (comparisonList.length === 0) {

        comparisonList = [country];

        renderComparison();

    }

}



// порівняння країн

function addToComparison(country) {

    if (comparisonList.length >= 3) {

        alert("Можна порівнювати не більше 3-х країн одночасно!");

        return;

    }

    if (comparisonList.some(c => c.cca3 === country.cca3)) return;

    

    comparisonList.push(country);

    renderComparison();

}



function renderComparison() {

    comparisonGrid.innerHTML = comparisonList.map(country => `

        <div class="country-card" style="border: 1px solid #3498db;">

            <img src="${country.flags.svg}" alt="Flag" style="height: 80px; object-fit: contain;">

            <h4>${country.translations?.ukr?.common || country.name.common}</h4>

            <p>👥 ${country.population.toLocaleString()}</p>

            <p>🏙 ${country.capital ? country.capital[0] : 'Н/Д'}</p>

            <button onclick="removeFromComparison('${country.cca3}')" style="background:#e74c3c; font-size: 12px; color: white; border: none; padding: 5px; cursor: pointer; border-radius: 4px;">Видалити</button>

        </div>

    `).join('');

}



window.removeFromComparison = function(code) {

    comparisonList = comparisonList.filter(c => c.cca3 !== code);

    renderComparison();

};





function renderCountries(countries) {

    countriesList.innerHTML = countries.map(country => `

        <div class="country-card">

            <img src="${country.flags.svg}" alt="Flag">

            <h4>${country.translations?.ukr?.common || country.name.common}</h4>

            <p style="font-size: 12px; color: #666;">${country.region}</p>

            <button onclick="searchCountry('${(country.translations?.ukr?.common || country.name.common).replace(/'/g, "\\'")}')">Детальніше</button>

        </div>

    `).join('');

}





function updateList() {

    let filtered = [...allCountries];

    

    if (regionFilter.value !== 'all') {

        filtered = filtered.filter(c => c.region === regionFilter.value);

    }

    

    if (sortSelect.value === 'asc') {

        filtered.sort((a, b) => a.population - b.population);

    } else if (sortSelect.value === 'desc') {

        filtered.sort((a, b) => b.population - a.population);

    }

    

    renderCountries(filtered.slice(0, 24));

}





function showLoader(show) { loader.classList.toggle('hidden', !show); }

function showError(msg) { 

    errorMessage.textContent = msg; 

    errorMessage.classList.remove('hidden'); 

}



function setupAutocomplete(inputElement, listElement, isComparison = false) {
    inputElement.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        listElement.innerHTML = ''; // Очищуємо старий список
        
        if (!val) return false;

        // Шукаємо країни за англійською назвою (name.common)
        const matches = allCountries.filter(c => 
            c.name.common.toLowerCase().startsWith(val)
        ).slice(0, 8); // Показуємо до 8 підказок

        matches.forEach(country => {
            const item = document.createElement('div');
            item.innerHTML = `<strong>${country.name.common.substr(0, val.length)}</strong>${country.name.common.substr(val.length)}`;
            
            item.addEventListener('click', function() {
                inputElement.value = country.name.common;
                listElement.innerHTML = '';
                searchCountry(inputElement.value, isComparison); // Одразу шукаємо
            });
            
            listElement.appendChild(item);
        });
    });
}


setupAutocomplete(document.getElementById('searchInput'), document.getElementById('main-autocomplete'), false);
setupAutocomplete(document.getElementById('compareInput'), document.getElementById('compare-autocomplete'), true);


document.addEventListener('click', function (e) {
    if (e.target.tagName !== 'INPUT') {
        document.querySelectorAll('.autocomplete-items').forEach(list => list.innerHTML = '');
    }
});




function hideError() { errorMessage.classList.add('hidden'); }


const autocompleteList = document.getElementById('autocomplete-list');

searchInput.addEventListener('input', function() {
    const val = this.value.toLowerCase();
    autocompleteList.innerHTML = '';
    
    if (!val) return false;

    // Фільтруємо країни
    const matches = allCountries.filter(c => 
        c.name.common.toLowerCase().startsWith(val)
    ).slice(0, 10); // Показуємо максимум 10 підказок

    matches.forEach(country => {
        const div = document.createElement('div');
        div.style.padding = "10px";
        div.style.cursor = "pointer";
        div.style.borderBottom = "1px solid #eee";
        div.innerHTML = `<strong>${country.name.common.substr(0, val.length)}</strong>${country.name.common.substr(val.length)}`;
        
        div.addEventListener('click', function() {
            searchInput.value = country.name.common;
            autocompleteList.innerHTML = '';
            searchCountry(searchInput.value); 
        });
        
        autocompleteList.appendChild(div);
    });
});


document.addEventListener('click', (e) => {
    if (e.target !== searchInput) autocompleteList.innerHTML = '';
});




searchBtn.addEventListener('click', () => searchCountry(searchInput.value));

addCompareBtn.addEventListener('click', () => searchCountry(compareInput.value, true));

regionFilter.addEventListener('change', updateList);

sortSelect.addEventListener('change', updateList);





init();