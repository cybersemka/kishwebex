const API_DOMAIN = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = 'a3f66b8e-3ca6-481a-8bc8-1052f9a12a1e';

function pluralize(n, content) {
    let result = content[2];
    n = Math.abs(n) % 100;
    let nt = n % 10;
    if (n >= 10 && n <= 20) result = content[2];
    else if (nt > 1 && nt < 5) result = content[0];
    else if (nt == 1) result = content[1];

    return `${n} ${result}`;
}

function createAlert(text, type) {
    const alertsContainer = document.getElementById('alerts');
    const alertElement = document.createElement('div');
    alertElement.classList.add('alert', `alert-${type}`, 'alert-dismissible');
    alertElement.setAttribute('role', 'alert');
    alertElement.innerHTML = `
        <div>${text}</div>
        <button class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertsContainer.appendChild(alertElement);
}

document.addEventListener('DOMContentLoaded', function () {
    const routes = document.querySelectorAll('#rout tr');
    const itemsPerPage = 9;
    let currentPage = 1;

    function showPage(page) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        routes.forEach((route, index) => {
            if (index >= startIndex && index < endIndex) {
                route.style.display = '';
            } else {
                route.style.display = 'none';
            }
        });
    }

    function highlightPage(page) {
        const pageLinks = document.querySelectorAll('.pagination a.page-link');
        pageLinks.forEach(link => {
            link.classList.remove('active');
        });

        const currentPageLink = document.querySelector(`.pagination a[href="#${page}"]`);
        if (currentPageLink) {
            currentPageLink.classList.add('active');
        }
    }

    function handlePaginationClick(event) {
        event.preventDefault();

        const targetPage = parseInt(event.target.getAttribute('href').substr(1));

        if (!isNaN(targetPage)) {
            currentPage = targetPage;
            showPage(currentPage);
            highlightPage(currentPage);
        } else if (event.target.getAttribute('aria-label') === 'Next') {
            currentPage++;
            showPage(currentPage);
            highlightPage(currentPage);
        } else if (event.target.getAttribute('aria-label') === 'Previous' && currentPage > 1) {
            currentPage--;
            showPage(currentPage);
            highlightPage(currentPage);
        }
    }

    const paginationLinks = document.querySelectorAll('.pagination a.page-link');
    paginationLinks.forEach(link => {
        link.addEventListener('click', handlePaginationClick);
    });

    const nextPageLink = document.getElementById('nextPage');
    nextPageLink.addEventListener('click', handlePaginationClick);

    const prevPageLink = document.getElementById('prevPage');
    prevPageLink.addEventListener('click', handlePaginationClick);
});

function showModal(guideData, routeData, modal) {
    const orderCnt = document.getElementById('order-body');
    const orderBtn = document.getElementById('order-send');

    orderCnt.innerHTML = '';

    let form = new FormData();
    form.set('guide_id', guideData.id);
    form.set('route_id', routeData.id);
    form.set('date', NaN);
    form.set('duration', 1);
    form.set('persons', 1);
    form.set('price', NaN);
    form.set('optionFirst', 0);
    form.set('optionSecond', 0);
    const raw = `
        <div class="row">ФИО гида: ${guideData.name}</div>
        <div class="row">Название маршрута: ${routeData.name}</div>
        <div class="row">
            <div>Дата:<div>
            <input type="date" class="form-control" data-name="date">
        </div>
        <div class="row">
            <div>Время:<div>
            <input type="time"class="form-control" data-name="time">
        </div>
        <div class="row">
            <div>Длительность:<div>
            <select class="form-control" data-name="duration">
                <option value="1" selected>1 Час</option>
                <option value="2">2 Часа</option>
                <option value="3">3 Часа</option>
            </select>
        </div>
        <div class="row">
            <div>Число человек:<div>
            <input
                type="number"
                value="1"
                class="form-control"
                min="1"
                max="20"
                data-name="persons"
            >
        </div>
        <div class="row">
            <div>Дополнительные опции:<div>
            <div>
                <input
                    type="checkbox"
                    id="featureA"
                    class="form-check-input"
                    data-name="optionFirst"
                >
                <label for="featureA" class="form-check-label">
                    Использовать скидку для пенсионеров
                </label>
                <p class="form-text">Стоимость уменьшается на 25%</p>
            </div>
            <div>
                <input
                    type="checkbox"
                    id="featureB"
                    class="form-check-input"
                    data-name="optionSecond"
                >
                <label for="featureB" class="form-check-label">
                    Трансфер до ближайших станций метро после экскурсии
                </label>
                <p class="form-text">
                    Увеличивает стоимость на 25% в выходные дни и на 30% в будние
                </p>
            </div>
        </div>
        
        <div class="row">
            <div>Cтоимость: <span id="order-price">NaN<span><div>
        </div>
    `;

    orderCnt.insertAdjacentHTML("beforeend", raw);
    const orderPrice = document.getElementById('order-price');

    orderCnt.onchange = (e) => {
        switch (e.target.dataset['name']) {
            case 'date':
                form.set('date', e.target.value);
                break;
            case 'time':
                form.set('time', e.target.value);
                break;
            case 'duration':
                form.set('duration', e.target.value);
                break;
            case 'persons':
                form.set('persons', e.target.value);
                break;
            case 'optionFirst':
                form.set('optionFirst', (e.target.checked ? 1 : 0));
                break;
            case 'optionSecond':
                form.set('optionSecond', (e.target.checked ? 1 : 0));
                break;
            default:
                return;
        }

        const date = form.get('date');
        const day = new Date(date).getDay();

        const time = form.get('time') ?? '';
        const hour = parseInt(time.split(':')[0]);
        const isMorning = (hour >= 9 && hour <= 12);
        const isEvening = (hour >= 20 && hour <= 23);

        const persons = parseInt(form.get('persons'));

        let priceForN = 0;
        if (isNaN(persons))
            priceForN = NaN;
        if (persons >= 5)
            priceForN = 1000;
        else if (persons >= 10)
            priceForN = 1500;

        let duration = parseInt(form.get('duration'));

        let price = guideData.pricePerHour
            * duration
            * ((isNaN(day) || isNaN(hour)) ? NaN : 1)
            * ((day == 0 || day == 6) ? 1.5 : 1)
            + (isMorning ? 400 : 0)
            + (isEvening ? 1000 : 0)
            + priceForN;

        if (form.get('optionFirst') == 1) {
            price -= parseInt(price * 0.25);
        }
        if (form.get('optionSecond') == 1) {
            price += persons * 1000;
        }

        form.set('price', price);

        if (isNaN(form.get('price'))) {
            orderPrice.textContent = 'NaN';
        } else {
            orderPrice.textContent = `${price}р`;
        }

    };

    orderBtn.onclick = () => {
        if (isNaN(form.get('price'))) return;
    
        modal.toggle();
        addOrder(form);
    
        const sendNotification = () => {
            const notification = document.getElementById('order-notification');
            notification.classList.remove('d-none');
            setTimeout(() => {
                notification.classList.add('d-none');
            }, 5000);
        };
    
        setTimeout(sendNotification, 500);
    };
}

function displayGuideTable(data, routeData) {
    document.getElementById('guidesSection').classList.remove('d-none');
    const cnt = document.getElementById('guide');
    const languageFilter = document.getElementById('language-filter');
    cnt.innerHTML = '';
    cnt.scrollIntoView({ behavior: 'smooth' });

    const languages = [...new Set(data.map(guide => guide.language))];

    languages.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageFilter.appendChild(option);
    });

    languageFilter.onchange = () => {
        const selectedLanguage = languageFilter.value;
        const filteredData = selectedLanguage ? data.filter(guide => guide.language === selectedLanguage) : data;
        renderGuides(filteredData, routeData);
    };

    const renderGuides = (filteredData, routeData) => {
        cnt.innerHTML = '';
        filteredData.forEach(element => {
            const guideCnt = cnt.appendChild(
                document.createElement('tr')
            );

            const workExperience = pluralize(
                element.workExperience,
                ['года', 'год', 'лет']
            );

            let row = `
                <td class="p-2 border">
                    <i class="bi bi-people-fill"></i>
                </td>
                <td class="p-2 border">${element.name}</td>
                <td class="p-2 border d-none d-sm-table-cell">
                    ${element.language}
                </td>
                <td class="p-2 border d-none d-md-table-cell">${workExperience}</td>
                <td class="p-2 border">${element.pricePerHour}р/час</td>`;
            guideCnt.insertAdjacentHTML("beforeend", row);

            const routeChoiseCnt = guideCnt.appendChild(
                document.createElement('td')
            );
            routeChoiseCnt.className = 'p-2 border';

            const routeChoise = routeChoiseCnt.appendChild(
                document.createElement('button')
            );
            routeChoise.className = 'btn btn-custom';
            routeChoise.textContent = 'Выбрать';
            routeChoise.onclick = () => {
                let modal = new bootstrap.Modal('#guideModal');
                modal.toggle();

                showModal(element, routeData, modal);
            };
        });
    };

    renderGuides(data, routeData);
}


function displayRouteTable(data) {
    const cnt = document.getElementById('rout');
    cnt.innerHTML = '';
    let i = 0;

    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('class', 'form-control mb-3');
    searchInput.setAttribute('placeholder', 'Поиск по названию маршрута');
    cnt.appendChild(searchInput);

    searchInput.addEventListener('input', function() {
        const searchValue = this.value.toLowerCase();

        const routes = document.querySelectorAll('#rout tr');
        routes.forEach(function(route) {
            const name = route.querySelector('td:nth-child(1)').textContent.toLowerCase();
            if (name.includes(searchValue)) {
                route.style.display = '';
            } else {
                route.style.display = 'none';
            }
        });
    });

    for (let element of data) {
        const routeCnt = cnt.appendChild(
            document.createElement('tr')
        );
        let row = `
            <td class="p-3 border">${element.name}</td>
            <td class="p-3 d-none d-md-table-cell border">
                ${element.description}
            </td>
            <td class="p-3 d-none d-lg-table-cell border">
                ${element.mainObject}
            </td>`;
        routeCnt.insertAdjacentHTML("beforeend", row);

        const routeChoise = routeCnt.appendChild(
            document.createElement('button')
        );
        routeChoise.className = 'btn btn-custom';
        routeChoise.textContent = 'Выбрать';
        routeChoise.onclick = () => {
            getGuidesData(element);
        };
        i++;

        if (i >= 10) {
            routeCnt.style.display = 'none';
        }
    }
}

function getGuidesData(routeData) {
    fetch(
        `${API_DOMAIN}/api/routes/${routeData.id}/guides?api_key=${API_KEY}`
    )
        .then((response) => { 
            if (!response.ok) { 
                throw new Error(`Ошибка ${response.status}`); 
            } 
            return response.json(); 
        }) 
        .then((data) => { 
            console.log(data);
            displayGuideTable(data, routeData);
        })
        .catch(e => console.log(e));
}

function addOrder(data) {
    fetch(
        `${API_DOMAIN}/api/orders?api_key=${API_KEY}`,
        { method: 'POST', body: data }
    )
        .then((response) => { 
            if (!response.ok) { 
                throw new Error(`Ошибка ${response.status}`); 
            } 
            return response.json();
        }) 
        .then((data) => {
            console.log(data);
            createAlert(
                'Заявка успешно создана',
                'success'
            );
        })
        .catch(e => {
            console.log(e);
            createAlert(
                'Во время заполнения заявки произошла ошибка. Попробуйте снова',
                'warning'
            );
        });
}

function getRouteData() { 
    fetch(
        `${API_DOMAIN}/api/routes?api_key=${API_KEY}`
    )
        .then((response) => { 
            if (!response.ok) { 
                throw new Error(`Ошибка ${response.status}`); 
            } 
            return response.json(); 
        }) 
        .then((data) => { 
            console.log(data); 
            displayRouteTable(data);
        })
        .catch(e => console.log(e));
}

getRouteData();
