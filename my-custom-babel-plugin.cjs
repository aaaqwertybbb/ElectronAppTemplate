// This file was originally generated with google AI

module.exports = function (babel) {
  const { types: t } = babel;

  // List all the function names you want to inline
  const TARGET_FUNCTIONS = [

    "get_DialogKind_None",
    "get_DialogKind_FindAll",
    "get_DialogKind_Settings",
    "get_DialogKind_DocumentSymbol",
    "get_DialogKind_Debug",

    "get_CommandKind_None",
    "get_CommandKind_Submenu",
    "get_CommandKind_Copy",
    "get_CommandKind_CopyAbsolutePath",
    "get_CommandKind_Cut",
    "get_CommandKind_Paste",
    "get_CommandKind_NewFile_Directory",
    "get_CommandKind_NewFile_File",
    "get_CommandKind_DeleteFile_Directory",
    "get_CommandKind_DeleteFile_File",
    "get_CommandKind_RenameFile_Directory",
    "get_CommandKind_RenameFile_File",
    "get_CommandKind_Find",
    "get_CommandKind_SelectFolder",
    "get_CommandKind_SelectWorkspace",


    "get_TreeViewNodeKind_None",
    "get_TreeViewNodeKind_isExpandable_isExpanded",
    "get_TreeViewNodeKind_isExpandable_NOTisExpanded",
    "get_TreeViewNodeKind_NOTisExpandable_isExpanded",
    "get_TreeViewNodeKind_NOTisExpandable_NOTisExpanded",

    "get_WidgetKind_None",
    "get_WidgetKind_InputText",
    "get_WidgetKind_YesCancel",

    "get_DIALOG_minTop",
    "get_DIALOG_minLeft",
    "get_DIALOG_minHeight",
    "get_DIALOG_minWidth",

    "get_RenderKind_None",
    "get_RenderKind_Scroll",
    "get_RenderKind_Resize",
    "get_RenderKind_InsertLtr",
    "get_RenderKind_TabKey",
    "get_RenderKind_IndentMore",
    "get_RenderKind_IndentLess",
    "get_RenderKind_BackspaceRtl",
    "get_RenderKind_DeleteLtr",
    "get_RenderKind_RemoveSelection",
    "get_RenderKind_Enter",
    "get_RenderKind_DuplicateOrPaste",
    "get_RenderKind_Clear",
    "get_RenderKind_SetText",
    "get_RenderKind_CreateViewport",
    "get_RenderKind_SyntaxHighlighting",
    "get_RenderKind_Cursor_flag_scrollIntoViewExplicit",
    "get_RenderKind_Cursor_flag_doNotScrollIntoView",
    "get_RenderKind_Cursor_n",

    "get_MENUrenderKind_None",
    "get_MENUrenderKind_Cursor",
    "get_MENUrenderKind_Set",
    "get_MENUrenderKind_Hide",

    "get_TREEVIEWrenderKind_None",
    "get_TREEVIEWrenderKind_Cursor",
    "get_TREEVIEWrenderKind_Create",
    "get_TREEVIEWrenderKind_Batch",
    "get_TREEVIEWrenderKind_Scroll",
    "get_TREEVIEWrenderKind_SetItems",
    "get_TREEVIEWrenderKind_FullReset",
    "get_TREEVIEWrenderKind_Scroll_PullDataDrawResult",
    "get_TREEVIEWrenderKind_Resize",

    "get_LISTrenderKind_None",
    "get_LISTrenderKind_Cursor",

    "get_WIDGETrenderKind_None",
    "get_WIDGETrenderKind_Show",
    "get_WIDGETrenderKind_Hide",

    "get_DIALOGrenderKind_None",
    "get_DIALOGrenderKind_Show",
    "get_DIALOGrenderKind_Hide",
    "get_DIALOGrenderKind_DimensionsChanged",

    "get_AUTOCOMPLETErenderKind_None",
    "get_AUTOCOMPLETErenderKind_Show",
    "get_AUTOCOMPLETErenderKind_Hide",
    "get_AUTOCOMPLETErenderKind_CursorSet",
    "get_AUTOCOMPLETErenderKind_CreateLines",
    "get_AUTOCOMPLETErenderKind_Scroll",
  ];

  return {
    name: "inline-direct-substitution-safe",
    visitor: {
      Program(path) {
        const functionsToInline = new Map();

        // Pass 1: Collect target functions and remove their definitions
        path.traverse({
          VariableDeclarator(varPath) {
            const varName = varPath.node.id.name;

            if (
              TARGET_FUNCTIONS.includes(varName) &&
              t.isArrowFunctionExpression(varPath.node.init)
            ) {
              const arrowFn = varPath.node.init;

              let bodyStatements;
              if (t.isBlockStatement(arrowFn.body)) {
                bodyStatements = arrowFn.body.body;
              } else {
                bodyStatements = [t.expressionStatement(arrowFn.body)];
              }

              functionsToInline.set(varName, {
                params: arrowFn.params.map(p => p.name),
                body: bodyStatements,
              });

              varPath.parentPath.remove();
            }
          }
        });

        if (functionsToInline.size === 0) return;

        // Pass 2: Safely replace the call expressions directly
        path.traverse({
          CallExpression(callPath) {
            const calleeName = callPath.node.callee.name;

            if (t.isIdentifier(callPath.node.callee) && functionsToInline.has(calleeName)) {
              const fnData = functionsToInline.get(calleeName);
              const args = callPath.node.arguments;
              
              // Clone the body statements for this specific call instance
              const specializedBody = fnData.body.map(stmt => t.cloneNode(stmt));

              // Map parameters to arguments
              const paramValueMap = new Map();
              fnData.params.forEach((paramName, index) => {
                paramValueMap.set(paramName, args[index] || t.identifier("undefined"));
              });

              // Substitute the variable values into the statements
              specializedBody.forEach(statement => {
                babel.traverse(statement, {
                  Identifier(idPath) {
                    if (
                      paramValueMap.has(idPath.node.name) &&
                      !(idPath.parentPath.isMemberExpression() && idPath.parentPath.node.property === idPath.node && !idPath.parentPath.node.computed)
                    ) {
                      const substitutionNode = paramValueMap.get(idPath.node.name);
                      idPath.replaceWith(t.cloneNode(substitutionNode));
                    }
                  }
                }, path.scope, path);
              });

              // Strip away ExpressionStatement wrappers if replacing code inline
              const nodesToInsert = specializedBody.map(node => {
                if (t.isExpressionStatement(node)) {
                  return node.expression;
                }
                return node;
              });

              // Safely swap out the exact call expression node without crashing on the parent lookups
              if (nodesToInsert.length === 1) {
                callPath.replaceWith(nodesToInsert[0]);
              } else if (nodesToInsert.length > 1) {
                callPath.replaceWithMultiple(nodesToInsert);
              } else {
                callPath.remove();
              }
            }
          }
        });
      }
    }
  };
};
