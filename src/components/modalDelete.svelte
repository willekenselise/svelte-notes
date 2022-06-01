<script>
    export let modalDelete, deleteItem, deleteArticle;
</script>

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
                    <button class="button button-large" on:click={deleteArticle(deleteItem)}>Supprimer</button>
                </div>
            </div>
        </div>     
    </div>

{/if}