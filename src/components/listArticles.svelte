<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/icon?family=Material+Icons"
/>
<script>
    let listArticles = [];
    let modalAdd, modalEdit,  modalDelete = false;
    let deleteModal = true;

    let searchTerm = "";

    let updatedArticle = {};
    let article = {
        id: undefined,
        title: '',
        description: '',
        category: '',
        status: '',
        created:undefined,
        updated: undefined,
    }


    let categories = [
        {
            id: 1,
            title: "Categorie 1"
        },
        {
            id: 2,
            title: "Categorie 2"
        },
        {
            id: 31,
            title: "Categorie 3"
        },
        {
            id: 4,
            title: "Categorie 4"
        },

    ];

    let keywords = [
        {
            id: 1,
            title : "Developpement web",
            choose : false,
        },
        {
            id: 2,
            title : "Design",
            choose : false,
        }
    ]
    

    if(localStorage.getItem("articles")){
        listArticles = JSON.parse(localStorage.getItem("articles"));
    }

    $: localStorage.setItem("articles", JSON.stringify(listArticles));


    $: searchArticles = listArticles.filter((art) => {
        return art.title.includes(searchTerm) || art.description.includes(searchTerm);
    })

    const createArticle = () => {
        
        if(!article.title.trim()) {
            article.title = '';
            return
        }

        article.description != '' || !article.description.trim() ? article.status = 'brouillon' : article.status = 'archive';
        article.id = Date.now();
        article.created = new Date().toLocaleDateString("fr");
        
        article.keywords = article.keywords.split(',');

        listArticles = [...listArticles, article];
        article = {
        id: undefined,
        title: '',
        description: '',
        category: '',
        status: '',
        keywords: [],
        }

        modalAdd = false;
    }

    const updateArticle = () => {
        const productIndex = listArticles.findIndex(p => p.id === updatedArticle.id);
        updatedArticle.description == '' || !updatedArticle.description.trim() ? updatedArticle.status = 'brouillon' : updatedArticle.status = 'archive';
        updatedArticle.updated = new Date().toLocaleDateString("fr");
        listArticles[productIndex]= updatedArticle;
        isNew = true;
        updatedArticle = {};

        modalEdit = false;
    }

    const deleteArticle = id => {
        listArticles = listArticles.filter(item => item.id !== id);
        modalDelete = false;
    }


</script>

<nav>
    <ul>
        <li>
            <ul class="nav-links">
                <li><a href="#" class="nav-current" >Catégorie 1</a></li>
                <li><a href="#">Catégorie 2</a></li>
                <li><a href="#">Catégorie 3</a></li>
            </ul>
        </li>
        <li>
            <ul class="nav-links">
                <li><a href="#">Notes</a></li>
                <li><a href="#">Vérouillé</a></li>
            </ul>
        </li>
        <li>
            <ul class="keywords">
                <li class="nav-current">Mot</li>
                <li>Mot clef 1</li>
                <li>Mot</li>
                <li>Mot clef 1</li>
                <li>Mot clef 1</li>
                <li>Mot clef 1</li>
            </ul>
        </li>
    </ul>
</nav>
<header>
    <div class="header-contain">
        <span class="search-input">
            <input type="text" name="" bind:value="{searchTerm}" placeholder="Rechercher...">
            <img src="./img/search.svg" alt="search">
         </span>
     </div>
 </header>

<main>
    <ul class="notes">
                          
        
{#each searchArticles as item}

    <li class="note" id="{item.id}">
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <p>{item.category ? item.category.title : ""}</p>
        <div class="note-foot">
            {#if item.keywords}
                <ul class="keywords">
                    {#each item.keywords as keyword}
                        <li>{keyword}</li>
                    {/each}
                </ul>
            {/if}
            <div class="buttons">
                <button class="button lock" on:click={deleteModal(item.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 30 30" ><path d="M 15 2 C 11.145666 2 8 5.1456661 8 9 L 8 11 L 6 11 C 4.895 11 4 11.895 4 13 L 4 25 C 4 26.105 4.895 27 6 27 L 24 27 C 25.105 27 26 26.105 26 25 L 26 13 C 26 11.895 25.105 11 24 11 L 22 11 L 22 9 C 22 5.2715823 19.036581 2.2685653 15.355469 2.0722656 A 1.0001 1.0001 0 0 0 15 2 z M 15 4 C 17.773666 4 20 6.2263339 20 9 L 20 11 L 10 11 L 10 9 C 10 6.2263339 12.226334 4 15 4 z"/></svg>                            
                </button>
                <button class="button edit" on:click={() => {modalEdit = true; updatedArticle=item}}>
                    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" ><path d="M 18.414062 2 C 18.158188 2 17.902031 2.0974687 17.707031 2.2929688 L 16 4 L 20 8 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.925594 2.0974687 18.669937 2 18.414062 2 z M 14.5 5.5 L 3 17 L 3 21 L 7 21 L 18.5 9.5 L 14.5 5.5 z"/></svg>
                </button>
                <button class="button delete" on:click={deleteArticle(item.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"/></svg>                            
                </button>
            </div>
        </div>
    </li>
{/each}
</ul>
    <div class="more" on:click={() => {modalAdd = true;}}><img src="./img/add.svg" alt="plus" ></div>
</main> 


{#if modalAdd }

    <form class="modal modal-add" on:submit|preventDefault={createArticle} >
        <div class="modal-bg close-modal" on:click={() => {modalAdd = false;}}></div>
        <div class="modal-inner">
            <div class="modal-wrap">
                <div class="icon-close close-modal" on:click={() => {modalAdd = false;}}></div>
                <h2 class="modal-h2">Ajouter une note</h2>
                <h3 class="modal-h3">Le titre:</h3>
                <span class="text">
                    <input type="text" bind:value={article.title} required>
                </span>
                <h3 class="modal-h3">Le texte:</h3>
                <span class="text">
                    <textarea name="note" bind:value={article.description} required></textarea>
                </span>
                <h3 class="modal-h3">Ajouter les mots-clefs:</h3>
                <span class="text text-small">
                    <textarea name="keywords" placeholder="Ecrire les mots clefs séparés par une vigurle" bind:value={article.keywords}></textarea>
                </span>
                <h3 class="modal-h3">Ajouter une catégorie:</h3>
                <span class="categories">
                    <select bind:value={article.category}>
                        {#each categories as category}
                            <option value={category}>
                                {category.title}
                            </option>
                        {/each}
                    </select>
                </span>
                <div class="modal-foot">
                    <button class="button button-large" on:click={() => {modalAdd = false;}}>Annuler</button>
                    <button type="submit" class="button button-large">Ajouter</button>
                </div>
            </div>
        </div>   
    </form>     

{/if}

{#if modalEdit}

<form class="modal modal-edit" on:submit|preventDefault={updateArticle} >
    <div class="modal-bg" on:click={() => {modalEdit = false;}}></div>
    <div class="modal-inner">
       <div class="modal-wrap">
            <div class="icon-close" on:click={() => {modalEdit = false;}}></div>
            <h2 class="modal-h2">Modifier une note</h2>
            <h3 class="modal-h3">Le titre:</h3>
                <span class="text">
                    <input type="text" bind:value={updatedArticle.title} required>
                </span>
            <h3 class="modal-h3">Le texte:</h3>
            <span class="text">
                <textarea name="note" placeholder="Ecrire votre note..." bind:value={updatedArticle.description} required></textarea>
            </span>
            <h3 class="modal-h3">Ajouter les mots-clefs:</h3>
            <span class="text text-small">
                <textarea name="keywords" placeholder="Ecrire les mots clefs séparés par une vigurle"  bind:value={updatedArticle.keywords}></textarea>
            </span>
            <h3 class="modal-h3">Ajouter des catégories:</h3>
            <span class="categories">
                <label>
                    <input type="checkbox" name="category" value="categorie-1">
                    <span>Catégorie 1</span>
                </label>
            </span>
            <div class="modal-foot">
                <button class="button button-large" on:click={() => {modalEdit = false;}}>Annuler</button>
                <button type="submit" class="button button-large">Ajouter</button>
            </div>
       </div>
    </div>
</form>

{/if}

{#if modalDelete}

    <div class="modal modal-delete">
        <div class="modal-bg"  on:click={() => {modalDelete = false;}}></div>
        <div class="modal-inner">
            <div class="modal-wrap">
                <div class="icon-close close-modal"></div>
                <span class="text">
                    Etes-vous sur de vouloir supprimer la note ?
                </span>
                <div class="modal-foot">
                    <button class="button button-large" on:click={() => {modalDelete = false;}}>Annuler</button>
                    <button class="button button-large">Supprimer</button>
                </div>
            </div>
        </div>     
    </div>

{/if}