define([], function () {

    return function Issue(issue) {
        var self = this;

        var projeto = Enumerable.from(window.projects)
            .where(function (x) { return x.id === issue.project_id; })
            .firstOrDefault("");

        self.Id = issue.id;

        self.Projeto = projeto.name;

        self.ProjetoAtivo = (projeto.status != 5 && projeto.status != 9) ? true : false;

        self.Tipo = function () {
            return Enumerable.from(window.trackers)
                .where(function (x) { return x.id === issue.tracker_id; })
                .select(function (x) { return x.name; })
                .firstOrDefault("");
        }();

        self.Nome = issue.subject;

        self.EsforcoEstimado = function () {
            var temFilhos = Enumerable.from(window.issues)
                .where(function (x) { return x.parent_id === issue.id })
                .toArray().length != 0;
            return (!temFilhos && issue.estimated_hours) ? issue.estimated_hours : 0;
        }();

        self.EsforcoRealizado = function () {
            return Enumerable.from(window.timeEntries)
                .where(function (x) { return x.issue_id === issue.id; })
                .sum("$.hours");
        }();

        self.PercentualConclusao = issue.done_ratio;

        self.DataInicio = issue.start_date;

        self.dataInicio = Date.parse(issue.start_date);

        self.DataFim = issue.due_date;

        self.dataFim = Date.parse(issue.due_date);

        self.Tamanho = function () {
            var tamanhoCustomFieldId = Enumerable.from(window.customfields)
                .where(function (x) { return x.name == "Tamanho"; })
                .select(function (x) { return x.id; })
                .firstOrDefault(null);

            var cvalue = Enumerable.from(window.customValues)
                .firstOrDefault(null, function (x) { return x.customized_type === "Issue" && x.customized_id === issue.id && x.custom_field_id === tamanhoCustomFieldId; });
            var tamanho = cvalue ? cvalue.value : null;
            tamanho = parseFloat(tamanho);
            if (isNaN(tamanho)) tamanho = 0;
            return tamanho;
        }();

        self.Status = function () {
            return Enumerable.from(window.statuses)
                .where(function (x) { return x.id === issue.status_id; })
                .select(function (x) { return x.name })
                .firstOrDefault("");
        }();

        self.RacionalConclusaoReal = self.PercentualConclusao / 100;

        self.RacionalConclusaoEstimado = function () {
            var racConclusaoEstimado = function () {
                var dataInicio = Date.parse(self.DataInicio);
                var dataFim = Date.parse(self.DataFim);
                var dataHoje = Date.now();
                if (!dataInicio || !dataFim) {
                    return 0;
                }
                else if (dataHoje < dataInicio) {
                    return 0;
                }
                else if (dataHoje > dataFim) {
                    return 1;
                }
                else {
                    //Referência: http://stackoverflow.com/a/2627482
                    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    var durEstimada = Math.round(Math.abs((dataInicio - dataFim) / (oneDay)));
                    var durReal = Math.round(Math.abs((dataInicio - dataHoje) / (oneDay)));
                    return durEstimada != 0 ? (durReal / durEstimada) : 0;
                }
            }();
            return !isNaN(racConclusaoEstimado) ? parseFloat(racConclusaoEstimado).toFixed(2) : -1;
        }();

        self.ValorAgregado = self.RacionalConclusaoReal * self.EsforcoEstimado;

        self.ValorPlanejado = self.RacionalConclusaoEstimado * self.EsforcoEstimado;

        self.CustomValues = function () {
            var arr = [];

            var cvalues = Enumerable.from(window.customValues)
                .where(function (x) { return x.customized_type === "Issue" && x.customized_id === issue.id; })
                .toArray();

            $.each(cvalues, function (index, item) {
                var valor = item.value;
                var chave = Enumerable.from(window.customfields)
                    .where(function (x) {
                        return x.id == item.custom_field_id && (x.field_format == "list" || x.field_format == "float");
                    })
                    .select(function (x) { return x.name; })
                    .firstOrDefault(null);
                arr.push({ CustomField: chave, CustomValue: valor });
            });

            return arr;
        }();

    };

});