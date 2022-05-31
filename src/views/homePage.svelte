<script>
	import ListArticles from '../components/listArticles.svelte';
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
            <input type="text" name="" value="" placeholder="Rechercher...">
            <img src="./assets/img/search.svg" alt="search">
         </span>
     </div>
 </header>
 
<ListArticles/>
