<script>
    export let modalAdd, listCategories, article, createArticle;
</script>


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
                        {#each listCategories as category}
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