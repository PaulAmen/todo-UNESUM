<script>
    import { taskStore } from '$lib/state.svelte.js';
    let { task, onedit } = $props();

    const priorityColors = {
        alta: 'bg-red-100 text-red-800 border-red-200',
        media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        baja: 'bg-green-100 text-green-800 border-green-200'
    };

    let colorClass = $derived(priorityColors[task.prioridad] || 'bg-gray-100 text-gray-800 border-gray-200');
</script>

<div class="border rounded-lg p-4 shadow-sm {colorClass} flex flex-col gap-2 transition-all hover:shadow-md">
    <div class="flex justify-between items-start">
        <h3 class="font-bold text-lg line-clamp-2">{task.titulo}</h3>
        <span class="text-xs uppercase px-2 py-1 rounded-full border bg-white/50 font-semibold tracking-wide">
            {task.tipo}
        </span>
    </div>
    
    <p class="text-sm opacity-90 line-clamp-3">{task.resumen}</p>
    
    {#if task.accion_sugerida}
        <div class="text-xs mt-2 italic font-medium">
            👉 {task.accion_sugerida}
        </div>
    {/if}

    {#if task.datos_evento}
        <div class="text-xs mt-1 text-gray-600">
            📅 {task.datos_evento.fecha} - {task.datos_evento.hora}
        </div>
    {/if}

    <div class="mt-auto pt-4 flex gap-2 items-center">
        <button 
            onclick={() => taskStore.toggleComplete(task)}
            class="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50 transition-colors font-medium shadow-sm"
        >
            {task.estado === 'completado' ? 'Reabrir' : 'Completar'}
        </button>

        <button 
            onclick={() => $props().onedit(task)}
            class="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50 transition-colors font-medium shadow-sm"
        >
            Editar
        </button>
        
        <div class="ml-auto">
             <button 
                 onclick={() => taskStore.deleteTask(task.id)}
                 class="text-red-500 hover:text-red-700 transition-colors text-sm p-1"
                 aria-label="Eliminar tarea"
            >
                🗑️
            </button>
        </div>
    </div>
</div>
