define(['underscore'], function (_) {

    return function Issue(issue) {
        var self = this;

        self.Id = issue.id;
        self.Titulo = issue.subject;

        var projeto = _.find(window.projects, function (x) { return x.id === issue.project_id; });
        
        self.Projeto = projeto.name;

        self.ProjetoAtivo = (projeto.status != 5 && projeto.status != 9) ? true : false;
        
        self.EsforcoEstimado = function () {
            var temFilhos = _.filter(window.issues, function (x) { return x.parent_id === issue.id }).length > 0;
            return (!temFilhos && issue.estimated_hours) ? issue.estimated_hours : 0;
        }();

        self.EsforcoRealizado = function () {
            var entries = _.filter(window.timeEntries, function (x) { return x.issue_id === issue.id; });
            return _.reduce(entries, function (memo, num) { return memo + num.hours; }, 0);
        }();

        self.Tamanho = function () {
            var tamanho = 0;
            var tamanhoCField = _.find(window.customfields, function (x) { return x.name === 'Tamanho'; })
            var tamanhoCValue = _.find(window.customValues, function (x) { return x.customized_type === "Issue" && x.customized_id === issue.id && x.custom_field_id === tamanhoCField.id; });
            if (tamanhoCValue != null && !isNaN(tamanhoCValue.value))
                tamanho = parseFloat(tamanhoCValue.value);
            return isNaN(tamanho) ? 0 : tamanho;
        }();

        self.Tipo = _.find(window.trackers, function (x) { return x.id === issue.tracker_id; }).name;

        self.Status = _.find(window.statuses, function (x) { return x.id === issue.status_id }).name;

        self.PercentualConclusao = issue.done_ratio;

        self.DataInicio = issue.start_date;

        self.dataInicio = Date.parse(issue.start_date);

        self.DataFim = issue.due_date;

        self.dataFim = Date.parse(issue.due_date);

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
            var arr = new Array();

            var cvalues = _.filter(window.customValues, function (x) { return x.customized_type === "Issue" && x.customized_id === issue.id; });

            _.each(cvalues, function (item,index) {
                var cfield = _.find(window.customfields,function (x) {
                    return x.id == item.custom_field_id && (x.field_format == "list" || x.field_format == "float");
                });
                if(cfield != null)
                    arr.push({ CustomField: cfield.name, CustomValue: item.value, Effort: self.EsforcoRealizado });
            });

            return arr;
        }();

        return self;
    }

});