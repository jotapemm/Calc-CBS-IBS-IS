/* ═══════════════════════════════════════════════════════════════════
   O JS do botão com luz. Faz UMA coisa: guardar onde o ponteiro entrou
   e saiu, em duas variáveis CSS. Quem anima é o botao-luz.css.

   Versão em JS puro do BotaoLuz.tsx do HUB. Lá o React passa as
   funções como props; aqui elas são penduradas uma vez, nos botões que
   têm a classe .btn-luz.

   O ouvinte vai no BOTÃO, não no conteúdo dele. Importa: estas telas
   reescrevem o innerHTML do botão a cada mudança de estado ("Processar
   Agora" vira "Na fila" e volta), e isso troca os filhos. Ouvinte no
   próprio botão sobrevive a essas trocas; dentro, seria perdido.
   ═══════════════════════════════════════════════════════════════════ */
(function botaoLuz() {
    function marcar(e) {
        const b = e.currentTarget;
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }

    function ligar() {
        for (const b of document.querySelectorAll('.btn-luz')) {
            b.addEventListener('mouseenter', marcar);
            b.addEventListener('mouseleave', marcar);
        }
    }

    /* Este arquivo entra com defer, então o documento já foi lido quando
       ele roda — mas o DOMContentLoaded protege de alguém incluir sem o
       defer um dia. Se já passou, o listener nunca dispara, daí o teste
       do readyState. */
    if (document.readyState === 'loading') {
        addEventListener('DOMContentLoaded', ligar);
    } else {
        ligar();
    }
})();
