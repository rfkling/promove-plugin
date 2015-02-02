define(['model/issue'], function (Issue) {

    return function Project(project) {
        var self = this;

        var projects = Enumerable.from(window.projects)
            .where(function (x) { return x.status != 5 && x.status != 9; })
            .toArray();

        var parent = null;
        parent = Enumerable.from(projects)
            .firstOrDefault(null, function (x) { return x.id === project.parent_id; })

        var grandParent = null;
        if (parent != null && parent.parent_id != null) {
            grandParent = Enumerable.from(projects)
                .firstOrDefault(null, function (x) { return x.id === parent.parent_id; });
        }

        var subProjects = null;
        subProjects = Enumerable.from(projects)
            .where(function (x) { return x.parent_id === project.id; })
            .toArray();

        var issues = Enumerable.from(window.issues)
            .where(function (x) { return x.project_id === project.id; })
            .toArray();

        $.each(subProjects, function (index, value) {
            issues = issues.concat(Enumerable.from(window.issues)
                .where(function (x) { return x.project_id === value.id; })
                .toArray());
        })

        self.Issues = function () {
            return $.map(issues, function (issue) {
                return new Issue(issue);
            });
        }();

        var melhorias = Enumerable.from(self.Issues)
            .where(function (x) { return x.Tipo === "Melhoria"; })
            .toArray();

        var defeitos = Enumerable.from(self.Issues)
            .where(function (x) { return x.Tipo === "Defeito"; })
            .toArray();

        var naoConformidades = Enumerable.from(self.Issues)
            .where(function (x) { return x.Tipo === "Não-Conformidade"; })
            .toArray();

        self.Id = project.id;
        self.Nome = project.name;
        self.Identifier = project.identifier;

        (function PopulaCamposArvoreProjetos() {
            if (parent != null && grandParent != null) {
                self.Tipo = "Projeto";
                self.Programa = parent.name;
                self.ProgramaId = parent.id;
                self.UnidadeOrganizacional = grandParent.name;
            }
            else if (parent != null && grandParent == null && subProjects.length > 0) {
                self.Tipo = "Programa";
                self.Programa = "";
                self.ProgramaId = 0;
                self.UnidadeOrganizacional = parent.name;
            }
            else {
                self.Tipo = "Unidade Organizacional";
                self.Programa = "";
                self.ProgramaId = 0;
                self.UnidadeOrganizacional = "";
            }
        })();

        self.SubProjetos = Enumerable.from(subProjects).select(function (x) { return { "Id": x.id, "Nome": x.name }; }).toArray();

        self.DataInicio = function () {
            var dataInicio = Enumerable.from(self.Issues)
            .where(function (x) { return x.dataInicio; })
            .select("$.dataInicio")
            .toArray();
            if (dataInicio.length > 0) {
                dataInicio = Math.min.apply(Math, dataInicio);
                dataInicio = new Date(dataInicio);
                dataInicio = dataInicio.toLocaleDateString();
            } else dataInicio = "";
            return dataInicio;
        }();

        self.DataFim = function () {
            var dataFim = Enumerable.from(self.Issues)
            .where(function (x) { return x.dataFim; })
            .select("$.dataFim")
            .toArray();
            if (dataFim.length > 0) {
                dataFim = Math.max.apply(Math, dataFim);
                dataFim = new Date(dataFim);
                dataFim = dataFim.toLocaleDateString();
            } else dataFim = "";
            return dataFim;
        }();

        self.Tamanho = Enumerable.from(self.Issues).sum("$.Tamanho").toFixed(2);

        self.EsforcoEstimado = Enumerable.from(self.Issues).sum("$.EsforcoEstimado").toFixed(2);

        self.EsforcoRealizado = Enumerable.from(self.Issues).sum("$.EsforcoRealizado").toFixed(2);

        self.SaldoHoras = (self.EsforcoEstimado - self.EsforcoRealizado).toFixed(2);

        self.ValorAgregado = Enumerable.from(self.Issues).sum("$.ValorAgregado").toFixed(2);

        self.ValorPlanejado = Enumerable.from(self.Issues).sum("$.ValorPlanejado").toFixed(2);

        self.PercentualAndamento = (self.EsforcoEstimado > 0) ? ((self.ValorAgregado / self.EsforcoEstimado) * 100).toFixed(2) : 0;

        self.PercentualHorasGastas = (self.EsforcoEstimado > 0) ? ((self.EsforcoRealizado / self.EsforcoEstimado) * 100).toFixed(2) : 0;

        self.DesvioPrazo = (self.ValorAgregado - self.ValorPlanejado).toFixed(2);

        self.DesvioCusto = (self.ValorAgregado - self.EsforcoRealizado).toFixed(2);

        self.CPI = (self.EsforcoRealizado > 0) ? (self.ValorAgregado / self.EsforcoRealizado).toFixed(2) : 0;

        self.EstimativaCustoFinal = (self.CPI > 0) ? (parseFloat(self.EsforcoRealizado) + parseFloat((self.EsforcoEstimado - self.ValorAgregado) / self.CPI)).toFixed(2) : 0;

        self.SPI = (self.ValorPlanejado > 0) ? (self.ValorAgregado / self.ValorPlanejado).toFixed(2) : 0;

        self.NaoConformidades = naoConformidades.length;

        self.NaoConformidadesStatus = function () {
            return Enumerable.from(naoConformidades)
                .groupBy("$.Status", null,
                function (key, g) {
                    var result = {
                        status: key,
                        total: g.count()
                    }
                    return result;
                }).toArray();
        }();

        self.NaoConformidadesEsforco = Enumerable.from(naoConformidades).sum("$.EsforcoRealizado").toFixed(2);

        self.NaoConformidadesRetrabalho = (self.EsforcoRealizado > 0) ? ((self.NaoConformidadesEsforco / self.EsforcoRealizado) * 100).toFixed(0) : 0;

        self.DNCP = (self.Tamanho > 0) ? (self.NaoConformidades / self.Tamanho).toFixed(2) : 0;

        self.Defeitos = defeitos.length;

        self.DefeitosStatus = function () {
            return Enumerable.from(defeitos)
                .groupBy("$.Status", null,
                function (key, g) {
                    var result = {
                        status: key,
                        total: g.count()
                    }
                    return result;
                }).toArray();
        }();

        self.DefeitosEsforco = Enumerable.from(defeitos).sum("$.EsforcoRealizado").toFixed(2);

        self.DefeitosRetrabalho = (self.EsforcoRealizado > 0) ? ((self.DefeitosEsforco / self.EsforcoRealizado) * 100).toFixed(0) : 0;

        self.DDP = (self.Tamanho > 0) ? (self.Defeitos / self.Tamanho).toFixed(2) : 0;

        self.Melhorias = melhorias.length;

        self.MelhoriasFechadas = function () {
            return Enumerable.from(melhorias)
                .where(function (x) { return x.Status === "Fechado" || x.Status === "Fechada"; })
                .count();
        }();

        self.MelhoriasRejeitadas = function () {
            return Enumerable.from(melhorias)
                .where(function (x) { return x.Status === "Rejeitado" || x.Status === "Rejeitada"; })
                .count();
        }();

        self.MelhoriasStatus = function () {
            return Enumerable.from(melhorias)
                .groupBy("$.Status", null,
                function (key, g) {
                    var result = {
                        status: key,
                        total: g.count()
                    }
                    return result;
                }).toArray();
        }();

        self.PMI = (self.Melhorias > 0) ? (self.MelhoriasFechadas / self.Melhorias).toFixed(2) * 100 : 0;

        self.PMR = (self.Melhorias > 0) ? (self.MelhoriasRejeitadas / self.Melhorias).toFixed(2) * 100 : 0;

        self.ProjetoMelhoria = function () { //Aqui, partimos da premissa que projetos de melhoria não terão defeitos
            if (self.Defeitos == 0 && self.Melhorias > 0)
                return true;
            else
                return false;
        }();

        self.CustomValues = function () {
            var arr = new Array();

            var cvalues = Enumerable.from(window.customValues)
                .where(function (x) { return x.customized_type === "Project" && x.customized_id === project.id; })
                .toArray();

            $.each(cvalues, function (index, item) {
                var valor = item.value;
                var chave = Enumerable.from(window.customfields)
                    .where(function (x) { return x.id == item.custom_field_id; })
                    .select(function (x) { return x.name; })
                    .firstOrDefault(null);
                arr.push({ CustomField: chave, CustomValue: valor });
            });

            return arr;
        }();

        self.TamanhoAgregado = self.EsforcoEstimado != 0 ? ((self.ValorAgregado / self.EsforcoEstimado) * self.Tamanho).toFixed(2) : "0";

        self.EsforcoAnaliseProjeto = function () {
            return Enumerable.from(self.Issues)
                .where(function (x) { return x.Tipo == "Análise e Projeto"; })
                .sum("$.EsforcoRealizado").toFixed(2);
        }();

        self.ProdutividadeAnaliseProjeto = (self.TamanhoAgregado != 0) ? (self.EsforcoAnaliseProjeto / self.TamanhoAgregado).toFixed(2) : "0";

        self.EsforcoConstrucao = function () {
            return Enumerable.from(self.Issues)
                .where(function (x) { return x.Tipo == "Construção"; })
                .sum("$.EsforcoRealizado").toFixed(2);
        }();

        self.ProdutividadeConstrucao = (self.TamanhoAgregado != 0) ? (self.EsforcoConstrucao / self.TamanhoAgregado).toFixed(2) : "0";

        self.EsforcoTestes = function () {
            return Enumerable.from(self.Issues)
                .where(function (x) { return x.Tipo == "Teste"; })
                .sum("$.EsforcoRealizado").toFixed(2);
        }();

        self.ProdutividadeTestes = (self.TamanhoAgregado != 0) ? (self.EsforcoTestes / self.TamanhoAgregado).toFixed(2) : "0";

        //Cores tabelão
        self.corIndice = function (indice) {
            var cor = "";
            if (indice < 0.8)
                cor = "danger";
            else if (indice > 0.8 && indice < 1)
                cor = "warning";
            else
                cor = "success";
            return cor;
        }
        self.corDensidade = function (densidade) {
            var cor = "";
            if (densidade < 0.05)
                cor = "success";
            else if (densidade > 0.05 && densidade < 0.1)
                cor = "warning";
            else
                cor = "danger";
            return cor;
        }

        self.corSPI = self.corIndice(self.SPI);
        self.corCPI = self.corIndice(self.CPI);
        self.corDDP = self.corDensidade(self.DDP);
        self.corDNCP = self.corDensidade(self.DNCP);

        //Tooltips tabelão
        self.toolCPI = function () {
            var html = [];
            html.push(
              "Valor Agregado: ",
              self.ValorAgregado, "</br>",
              "Esforço Realizado: ",
              self.EsforcoRealizado
            );
            return html.join("");
        }();
        self.toolSPI = function () {
            var html = [];
            html.push(
              "Valor Agregado: ",
              self.ValorAgregado, "</br>",
              "Valor Planejado: ",
              self.ValorPlanejado
            );
            return html.join("");
        }();
        self.toolDDP = function () {
            var html = [];
            html.push(
              "Tamanho: ",
              self.Tamanho, "</br>",
              "Defeitos: ",
              self.Defeitos
            );
            return html.join("");
        }();
        self.toolDNCP = function () {
            var html = [];
            html.push(
              "Tamanho: ",
              self.Tamanho, "</br>",
              "Não-Conformidades: ",
              self.NaoConformidades
            );
            return html.join("");
        }();
        self.toolAndamento = function () {
            var html = [];
            html.push(
              "Valor Agregado:",
              self.ValorAgregado, "</br>",
              "Esforço Estimado: ",
              self.EsforcoEstimado
            );
            return html.join("");
        }();
        self.toolHrsGastas = function () {
            var html = [];
            html.push(
              "Esforço Realizado: ",
              self.EsforcoRealizado, "</br>",
              "Esforço Estimado: ",
              self.EsforcoEstimado
            );
            return html.join("");
        }();
    };

});