new Swiper('.swiper-container', {
    loop: true,

    // Navigation arrows
    navigation: {
        nextEl: '.slider-button-next',
        prevEl: '.slider-button-prev',
    },
});

// cart

const buttonCart = document.querySelector('.button-cart'); // кнопка корзины
const modalCart = document.querySelector('#modal-cart'); // модальное окно корзины

const openModal = function () {
    modalCart.classList.add('show');
};
const closeModal = function () {
    modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal);
modalCart.addEventListener('click', e => {
    const target = e.target;
    if (target.classList.contains('overlay') || target.classList.contains('modal-close')) closeModal();
})

// scroll smooth - плавная прокрутка к верху страницы
{
    const scrollLinks = document.querySelectorAll('a.scroll-link'); // все ссылки на прокрутку
    for (const scrollLink of scrollLinks) { // перебираем все ссылки
        scrollLink.addEventListener('click', e => { // вешаем обработчик событий
            e.preventDefault(); // отключаем стандартное поведение браузера
            const id = scrollLink.getAttribute('href'); // получаем аттрибут href у ссылки
            document.querySelector(id).scrollIntoView({ // добавляем ссылке метод прокрутки
                behavior: 'smooth',
                block: 'start',
            })
        });
    }
}

// goods

const more = document.querySelector('.more'), // кнопка View All
    navigationLink = document.querySelectorAll('.navigation-link'), // все пункты меню
    longGoodsList = document.querySelector('.long-goods-list'); // Блок куда будут рендериться товары

/* ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ С ТОВАРАМИ. ВАРИАНТ 1 */
/* ассинхронная функция получения товаров из базы данных
* создаем переменную result, в которую запишится результат подключения к базе данных
* await - ждет когда fetch выполнится и вернет ответ и только тогда записывает его в result
* fetch вернет ответ в котором содержится статус подключения, либо 200 ок:true, либо 404 ok:false
* Если придет false, то выведем ошибку
* Если придет true, то возвращаем метод json() - который преобразовывает строку json в объект javaScript*/
const getGoods = async () => {
    const result = await fetch('db/db.json');
    if (!result.ok) {
        throw 'Error:' + result.status
    }
    return await result.json();
};

/* ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ С ТОВАРАМИ. ВАРИАНТ 2 */

// fetch('db/db.json')
// 	.then(function (response) {
// 		return response.json();
// 	})
// 	.then(function (data) {
// 		console.log(data)
// 	})

/* Создаем карточку товара*/
const createCard = function ({label, name, description, id, price, img}) {
    const card = document.createElement('div'); // создаем элемент div
    card.className = 'col-lg-3 col-sm-6'; // добавляем классы к элементу div
    /* вставляем верстку в элемент div
    * из objCard вытаскиваем свойства и вставляем в верстку
    * с помощью тернарного оператора проверяем наличие свойства label у товара
    * если есть то вставляем label, если нет то вставляем пустоту*/
    card.innerHTML = `
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>` : ''}
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$${price}</span>
			</button>
		</div>
	`;
    // и возвращаем этот элемент
    return card;
};

// функция вывода товаров на страницу
const renderCards = data => {
    longGoodsList.textContent = ''; // очищаем блок с товарами
    /* перебираем все товары из data и передаем их в функцию createCard
    * createCard создает карточку с этим товаром и возвращает ее
    * и эта карточка записывается в новый массив, который создает метод map */
    const cards = data.map(createCard)

    /* перебираем новый массив cards методом forEach
    * forEach ничего не возвращает, а просто вставляет эту карточку в блок на странице с помощью метода append */
    cards.forEach(cards => {
        longGoodsList.append(cards)
    })

    /* перебираем новый массив cards c помощью спред оператора ...
    * спред оператор распаковывает массив на отдельные
    * и уже каждый элемент вставляет в блок на странице с помощью метода append */
    longGoodsList.append(...cards);

    document.body.classList.add('show-goods')
}

/* при клике по кнопке ViewAll
* отключаем стандартное поведение браузера при клике по ссылке с помощью метода preventDefault()
* Вызываем функцию getGoods(), в которую вернется promise и обрабатываем этот promise методом then
* Внутрь then передается функция callback, которая будет вызвана после того как then выполнится*/

more.addEventListener('click', (e) => {
    e.preventDefault();
    getGoods().then(renderCards);
})

/* функция фильтрации товаров по категориям
* получаем товары из базы данных и с помощью метода filter перебираем их
* если категория товара совпадает со значением ссылки на которую нажали,
* то записывам этот товар в переменную filteredGoods
* после фильтрации отправляем отфильтрованные товары в функцию отрисовки товаров на странице - renderCards*/
const filterCards = (field, value) => {
    getGoods()
        .then((data) => {
            const filteredGoods = data.filter(good => good[field] === value);
            return filteredGoods;
        })
        .then(renderCards);
}

/* обрабатываем нажатие по ссылкам меню
* перебираем все ссылки методом forEach и навешиваем обработчик события при клике
* отключаем стандартное поведение браузера при клике по ссылке
* получаем в field значение аттрибута data-field (категория) через dataset
* получаем значение самой ссылки (название)
* и передаем эти переменные в функцию фильтрации товаров по категориям либо выводим все товары*/
navigationLink.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const field = link.dataset.field;
        const value = link.textContent;
		(value === 'All') ? getGoods().then(renderCards) : filterCards(field, value)
    })
})