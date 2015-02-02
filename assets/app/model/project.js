define(['model/issue', 'underscore'], function (Issue, _) {

    return function Project(project) {
        var self = this;

        self.Id = project.id;
        self.Nome = project.name;

        var projetoPai = _.find(window.projects, function (x) { return x.id === project.parent_id; });
        self.ProjetoPai = projetoPai != null ? projetoPai.name : '';

        var issues = _.filter(window.issues, function (x) { return x.project_id === self.Id; });
        self.Issues = _.map(issues, function (x) { return new Issue(x); });

        self.UltimaAtividade = function () {
            var timeEntries = _.filter(window.timeEntries, function (x) { return x.project_id === self.Id; })
            if (timeEntries.length > 0) {
                var data = _.max(timeEntries, function (x) { return x.id; }).spent_on.split('-');
                return new Date(data[0], data[2], data[1]);
            }
            else {
                return 0;
            }
        }();

        self.EsforcoEstimado = _.reduce(self.Issues, function (memo, num) { return memo + num.EsforcoEstimado; }, 0).toFixed(2);
        self.EsforcoRealizado = _.reduce(self.Issues, function (memo, num) { return memo + num.EsforcoRealizado; }, 0).toFixed(2);
        self.ValorPlanejado = _.reduce(self.Issues, function (memo, num) { return memo + num.ValorPlanejado; }, 0).toFixed(2);
        self.ValorAgregado = _.reduce(self.Issues, function (memo, num) { return memo + num.ValorAgregado; }, 0).toFixed(2);
        self.Tamanho = _.reduce(self.Issues, function (memo, num) { return memo + num.Tamanho; }, 0).toFixed(2);

        self.Defeitos = _.reduce(self.Issues, function (memo, issue) {
            if (_.indexOf(['Defeito', 'Bug'], issue.Tipo) > -1)
                memo += 1;
            return memo;
        }, 0).toFixed(2);

        self.NaoConformidades = _.reduce(self.Issues, function (memo, issue) {
            if (_.indexOf(['Não-Conformidade', 'Não Conformidade'], issue.Tipo) > -1)
                memo += 1;
            return memo;
        }, 0).toFixed(2);

        self.CPI = (self.EsforcoRealizado > 0) ? (self.ValorAgregado / self.EsforcoRealizado).toFixed(2) : 0;
        self.SPI = (self.ValorPlanejado > 0) ? (self.ValorAgregado / self.ValorPlanejado).toFixed(2) : 0;
        self.DDP = (self.Tamanho > 0) ? (self.Defeitos / self.Tamanho).toFixed(2) : 0;
        self.DNCP = (self.Tamanho > 0) ? (self.NaoConformidades / self.Tamanho).toFixed(2) : 0;
        self.PercentualAndamento = (self.EsforcoEstimado > 0) ? ((self.ValorAgregado / self.EsforcoEstimado) * 100).toFixed(2) : 0;
        self.PercentualHrsGastas = (self.EsforcoEstimado > 0) ? ((self.EsforcoRealizado / self.EsforcoEstimado) * 100).toFixed(2) : 0;
        self.TamanhoAgregado = self.EsforcoEstimado != 0 ? ((self.ValorAgregado / self.EsforcoEstimado) * self.Tamanho).toFixed(2) : 0;

        self.SaldoHoras = (self.EsforcoEstimado - self.EsforcoRealizado).toFixed(2);
        self.DesvioPrazo = (self.ValorAgregado - self.ValorPlanejado).toFixed(2);
        self.DesvioCusto = (self.ValorAgregado - self.EsforcoRealizado).toFixed(2);

        self.selected = false;

        return self;
    }

});