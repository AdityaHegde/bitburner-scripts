<script>
</script>

<style>
    body {
        --prilt: #FFF;
        --pri: #F8F8F2;
        --pridk: #FAFAEB;
        --successlt: #ADE146;
        --success: #A6E22E;
        --successdk: #98E104;
        --errlt: #FF69A0;
        --err: #F92672;
        --errdk: #D10F56;
        --seclt: #AAA;
        --sec: #888;
        --secdk: #666;
        --warnlt: #E1D992;
        --warn: #E6DB74;
        --warndk: #EDDD54;
        --infolt: #92E1F1;
        --info: #66D9EF;
        --infodk: #31CDED;
        --welllt: #444;
        --well: #222;
        --white: #fff;
        --black: #000;
        --hp: #F92672;
        --money: #E6DB74;
        --hack: #A6E22E;
        --combat: #75715E;
        --cha: #AE81FF;
        --int: #66D9EF;
        --rep: #E69F66;
        --disabled: #66cfbc;
        --bgpri: #272822;
        --bgsec: #1B1C18;
        --button: #333;
        --ff: "Lucida Console"
    }

    .box {
        position: fixed;
        border: 1px solid var(--welllt);
        width: min-content;
        font: 14px var(--ff);
        color: var(--pri);
        background: var(--bgsec)
    }

    .box * {
        vertical-align: middle;
        margin: 0;
        font: inherit
    }

    .box > .head {
        display: flex;
        white-space: pre;
        user-select: none;
        background: var(--bgpri);
        padding: 2px;
        cursor: move;
        border-bottom: 1px solid var(--welllt)
    }

    .box > .body {
        padding: 2px
    }

    .box .title {
        margin: 0 auto 0 10px
    }

    .box.c > .body {
        display: none
    }

    .box.prompt {
        box-shadow: 0 0 0 10000px #0007;
        min-width: 400px
    }

    .box.prompt > .head > .icon {
        display: none
    }

    .icon {
        cursor: pointer;
        font: 25px "codicon";
        line-height: 0.9
    }

    .icon.ud::after {
        content: ""
    }

    .box.c .icon.ud::after {
        content: ""
    }

    .box :is(input,select,button,textarea) {
        color: var(--pri);
        outline: none;
        border: none;
        white-space: pre
    }

    .box :is(textarea,.log) {
        width: 100%;
        white-space: pre-wrap;
        font-size: 12px;
        background: none;
        padding: 0px;
        height: 100%;
        overflow-y: scroll
    }

    .box :is(input,select) {
        padding: 3px;
        background: var(--well);
        border-bottom: 1px solid var(--prilt);
        transition: border-bottom 250ms
    }

    .box input:hover {
        border-bottom: 1px solid var(--black)
    }

    .box input:focus {
        border-bottom: 1px solid var(--prilt)
    }

    .box :is(button,input[type=checkbox]) {
        background: var(--button);
        transition: background 250ms;
        border: 1px solid var(--well)
    }

    .box :is(button,input[type=checkbox]):hover {
        background: var(--bgsec)
    }

    .box :is(button,input[type=checkbox]):focus, select {
        border: 1px solid var(--secdk)
    }

    .box button {
        padding: 6px 8px;
        user-select: none
    }

    .box input[type=checkbox] {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px
    }

    .box input[type=checkbox]:checked::after {
        font: 22px codicon;
        content: ""
    }

    .g2 {
        display: grid;
        grid:auto-flow auto / auto auto;
        gap: 6px;
        margin: 5px;
        place-items: center
    }

    .g2 > .l {
        justify-self: start
    }

    .g2 > .r {
        justify-self: end
    }

    .g2 > .f {
        grid-column: 1 / span 2;
        text-align: center
    }

    .resizer {
        width: 100%;
        min-width: 99%;
        resize: both;
        overflow: hidden
    }

    .ts {
        color: var(--infolt)
    }

    .hidden, .tooltip {
        display: none
    }

    *:hover > .tooltip {
        display: block;
        position: absolute;
        left: -5px;
        bottom: calc(100% + 5px);
        border: 1px solid var(--welllt);
        background: var(--bgsec);
        color: var(--pri);
        font: 14px var(--ff);
        padding: 5px;
        white-space: pre
    }
</style>

<div class="box">
  <div class="head">
    <a class="icon">\uea74</a>
    <span class="title">Title!</span>
    <a class="icon ud"></a>
    <a class="icon close">\ueab8</a>
  </div>
  <div class="body">
  </div>
</div>
