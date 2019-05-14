(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []

  const dataPanel = document.getElementById('data-panel')
  const searchBtn = document.getElementById('submit-search')
  const searchInput = document.getElementById('search')

  const pagination = document.getElementById('pagination')
  const displayMode = document.getElementById('display-mode')
  const ITEM_PER_PAGE = 12
  const DISPLAY_MODE_CARD = 0
  const DISPLAY_MODE_LIST = 1
  let displayModeFlag = DISPLAY_MODE_CARD
  let paginationData = []
  let currentPage = 1

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getPageData(1, data)
    getTotalPages(data)
  }).catch((err) => console.log(err))

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search btn click event
  searchBtn.addEventListener('click', event => {
    let results = []
    event.preventDefault()
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    getTotalPages(results)
    getPageData(1, results)
  })

  // listen to the display mode
  displayMode.addEventListener('click', (event) => {
    if (event.target.matches('#card-display-mode')) {
      displayModeFlag = DISPLAY_MODE_CARD
      getPageData(currentPage)
    } else if (event.target.matches('#list-display-mode')) {
      displayModeFlag = DISPLAY_MODE_LIST
      getPageData(currentPage)
    }
  })

  // add pagination event listener
  pagination.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      currentPage = event.target.dataset.page
      getPageData(event.target.dataset.page)
    }
  })

  function displayDataList(data) {
    let htmlContent = ''
    data.forEach(function (item, index) {
      if (displayModeFlag === DISPLAY_MODE_CARD) {
        htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h6>
            </div>

            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
      } else if (displayModeFlag === DISPLAY_MODE_LIST) {
        htmlContent += `
        <div class="col-sm-12 border-top">
            <div class="movie-item-body mt-3 float-left">
              <h6 class="">${item.title}</h6>
            </div>
            <div class="float-right mt-2 mb-2">
              <!-- "More" button -->
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
        </div>
      `
      }
    })
    dataPanel.innerHTML = htmlContent
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)
  }
})()
