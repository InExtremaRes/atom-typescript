import {QuickFix, QuickFixQueryInformation, Refactoring} from "./quickFix";
import * as ts from "typescript";
import * as ast from "./astUtils";
import {EOL} from "os";
import {displayPartsToString, typeToDisplayParts, SyntaxKind} from "typescript";


export default class QuotesToQuotes implements QuickFix {
    key = QuotesToQuotes.name;

    canProvideFix(info: QuickFixQueryInformation): string {
        if (info.positionNode.kind === SyntaxKind.StringLiteral) {
            if (info.positionNode.getText().trim()[0] === `'`) {
                return `Convert ' to "`;
            }
            if (info.positionNode.getText().trim()[0] === `"`) {
                return `Convert " to '`;
            }
        }
    }

    provideFix(info: QuickFixQueryInformation): Refactoring[] {

        var text = info.positionNode.getText();
        var quoteCharacter = text.trim()[0];
        var nextQuoteCharacter = quoteCharacter === "'" ? '"' : "'";        

        // STOLEN : https://github.com/atom/toggle-quotes/blob/master/lib/toggle-quotes.coffee
        var quoteRegex = new RegExp(quoteCharacter, 'g')
        var escapedQuoteRegex = new RegExp(`\\\\${quoteCharacter}`, 'g')
        var nextQuoteRegex = new RegExp(nextQuoteCharacter, 'g')

        var newText = text
            .replace(nextQuoteRegex, `\\${nextQuoteCharacter}`)
            .replace(escapedQuoteRegex, quoteCharacter);

        newText = nextQuoteCharacter + newText.substr(1, newText.length - 2) + nextQuoteCharacter

        var refactoring: Refactoring = {
            span: {
                start: info.positionNode.getStart(),
                length: info.positionNode.end - info.positionNode.getStart()
            },
            newText,
            filePath: info.filePath
        };

        return [refactoring];
    }
}