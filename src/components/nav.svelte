<script>
    export let listCategories, listKeywords;
</script>

<nav>
    <ul>
        <li>
            <ul class="nav-links">

                {#if listCategories}

                    {#each listCategories as category}

                        <li>{category.title}</li>
                        
                    {/each}

               {/if}
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
                {#if listKeywords}

                    {#each listKeywords as keyword}

                        <li>{keyword}</li>
                        
                    {/each}

               {/if}
            </ul>
        </li>
    </ul>
</nav>