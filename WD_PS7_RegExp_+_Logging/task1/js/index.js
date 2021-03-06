$(function () {

    const regExp = {
        ip: /^((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9]?[0-9])$/,
        url: /^([a-zA-Z]+:[\/]{2}?).*$/,
        email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        date: /^\s*(3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2})\s*$/,
        time: /^(?:2[0-3]|[0-1][0-9]):(?:[0-5][0-9]):(?:[0-5][0-9])$/
    };
    const $form = $('#form');
    const $js = $("#JS");
    const $php = $("#PHP");

    $js.on('click', function () {
        event.preventDefault();
        let data = $form.serializeArray();
        $.each(data, function () {
            let name = this.name;
            const result = regExp[this.name].test(this.value);
            $(`#${name}`).removeClass('ok bad');
            true == result ? $(`#${name}`).addClass("ok") : $(`#${name}`).addClass("bad");
        });
    });

    $php.on('click', function () {
        event.preventDefault();
        var time = performance.now();
        let data = $form.serializeArray();
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: 'handl.php',
            data: {
                data: data
            }
        }).done(function (response) {
            console.log("done  - " + response);
            console.log(response);
            for (let value in response) {
                console.log(`${response[value]}`);
                console.log(value);
                $(`#${value}`).removeClass('ok bad');
                true === response[value] ? $(`#${value}`).addClass('ok') : $(`#${value}`).addClass('bad');
            }
        }).fail(function () {
            console.log('err');
        });
        time = performance.now() - time;
        console.log('Время выполнения = ', time);

       /* $.each(data, function () {
            let name = this.name;
            let value = this.value;
            $.ajax({
                type: 'POST',
                dataType: "json",
                url: 'handl.php',
                data: {
                    name: name,
                    value: value
                }
            }).done(function (response) {
                console.log("done  - " + response);
                $(`#${name}`).removeClass('ok bad');
                true == response ? $(`#${name}`).addClass("ok") : $(`#${name}`).addClass("bad");
            }).fail(function () {
                console.log("err");
            });
        });*/

    });
});
