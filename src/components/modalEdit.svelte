<script>
    export let modalEdit, updatedArticle;
</script>

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
                <select bind:value={updatedArticle.category}>
                    {#each listCategories as category}
                        <option value={category}>
                            {category.title}
                        </option>
                    {/each}
                </select>
            </span>
            <div class="modal-foot">
                <button class="button button-large" on:click={() => {modalEdit = false;}}>Annuler</button>
                <button type="submit" class="button button-large">Ajouter</button>
            </div>
       </div>
    </div>
</form>

{/if}