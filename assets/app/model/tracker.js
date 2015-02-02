define(['model/issue'], function (Issue) {

    return function Tracker(tracker) {
        var self = this;

        var mappedIssues = _.map(_.filter(window.issues, function (x) { return x.tracker_id === tracker.id; }), function (issue) {
            return new Issue(issue);
        });

        self.Id = tracker.id;

        self.Nome = tracker.name;

        self.Issues = _.filter(mappedIssues, function (x) { return x.ProjetoAtivo == true; });

        self.Count = self.Issues.length;

        self.StatusGbCount = _.countBy(self.Issues, function (x) { return x.Status; });

        self.CustomValues = function () {
            var extractAllIssuesCustomValues = _.pluck(self.Issues, 'CustomValues');
            var flatenToASingleArray = _.flatten(extractAllIssuesCustomValues);
            var extractCustomFieldsName = _.pluck(flatenToASingleArray, 'CustomField')
            var uniqueCustomFields = _.union(extractCustomFieldsName);
            var aggregatedCfieldsResult = new Array();
            _.each(uniqueCustomFields, function (customFieldName, index) {
                if (customFieldName != "0") {
                    var defaultstring = "Nenhum";
                    var cvaluesObj = _.filter(flatenToASingleArray, function (x) { return x.CustomField == customFieldName; });
                    cvaluesObj = _.map(cvaluesObj, function (x) { //Fix porque as vezes o objeto existe mas sem valor. Seta default:
                        x.CustomValue = x.CustomValue ? x.CustomValue : defaultstring;
                        return x;
                    });
                    if (cvaluesObj.length < self.Count) { //Fix para quando os objetos não batem com o total, gerando o gap com string default
                        var dif = self.Count - cvaluesObj.length;
                        for (var i = 0; i < dif ; i++) {
                            cvaluesObj.push({ CustomField: customFieldName, CustomValue: defaultstring, Effort: 0 });
                        };
                    }
                    var aggregated = _.reduce(cvaluesObj, function (memo, customValue) { //Forma lusitana de fazer groupby. SDDS LINQ
                        var existing = _.find(memo, function (x) { return x.CustomValue == customValue.CustomValue });
                        if (existing != null) {
                            existing.Count += 1;
                            existing.Effort += customValue.Effort;
                        } else {
                            existing = { Count: 0, Effort: 0 }
                            memo.push({ CustomField: customValue.CustomField, CustomValue: customValue.CustomValue, Count: existing.Count + 1, Effort: existing.Effort + customValue.Effort });
                        }
                        return memo;
                    }, []);
                    var object = _.reduce(aggregated, function (memo, group) {
                        memo.GroupByValue.push(_.omit(group,'CustomField'));
                        return memo;
                    }, { CustomField: customFieldName, GroupByValue: []});
                    aggregatedCfieldsResult.push(object);
                }
            });
            return aggregatedCfieldsResult;
        }();

    };

});