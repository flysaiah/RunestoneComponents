# Copyright (C) 2011  Bradley N. Miller
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

__author__ = 'isaiahmayerchak'

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst import Directive

def setup(app):
    app.add_directive('clickablearea',ClickableArea)
    app.add_javascript('clickable.js')
    app.add_javascript('timedclickable.js')
    app.add_stylesheet('clickable.css')

    app.add_node(ClickableAreaNode, html=(visit_ca_node, depart_ca_node))


TEMPLATE = """
<div data-component="clickablearea" id="%(divid)s" %(table)s %(correct)s %(incorrect)s>
<span data-question>%(question)s</span>%(feedback)s%(clickcode)s
"""
TEMPLATE_END = """
</div>
"""

class ClickableAreaNode(nodes.General, nodes.Element):
    def __init__(self,content):
        """
        Arguments:
        - `self`:
        - `content`:
        """
        super(ClickableAreaNode,self).__init__()
        self.ca_options = content

# self for these functions is an instance of the writer class.  For example
# in html, self is sphinx.writers.html.SmartyPantsHTMLTranslator
# The node that is passed as a parameter is an instance of our node class.
def visit_ca_node(self,node):
    res = TEMPLATE

    if "feedback" in node.ca_options:
        node.ca_options["feedback"] = "<span data-feedback>" + node.ca_options["feedback"] + "</span>"
    else:
        node.ca_options["feedback"] = ""

    if "iscode" not in node.ca_options:
        node.ca_options["correct"] = "data-cc=" + '"' + node.ca_options["correct"] + '"'
        node.ca_options["incorrect"] = "data-ci=" + '"' + node.ca_options["incorrect"] + '"'
    else:
        node.ca_options["correct"] = ""
        node.ca_options["incorrect"] = ""

    res = res % node.ca_options

    self.body.append(res)

def depart_ca_node(self,node):
    res = ""
    res = TEMPLATE_END % node.ca_options
    self.body.append(res)


class ClickableArea(Directive):
    required_arguments = 1
    optional_arguments = 0
    has_content = True
    final_argument_whitespace = True
    option_spec = {"question":directives.unchanged,
        "feedback":directives.unchanged,
        "iscode":directives.flag,
        "correct":directives.unchanged,
        "incorrect":directives.unchanged,
        "table":directives.flag
    }

    def run(self):
        """
            process the multiplechoice directive and generate html for output.
            :param self:
            :return:
            .. clickablearea:: identifier
                :question: Question text
                :feedback: Optional feedback for incorrect answer
                :iscode: Boolean that if present will put the content into a <pre>

                --Content--
        """
        self.assert_has_content()
        self.options['divid'] = self.arguments[0]
        if "iscode" in self.options:
            source = "\n".join(self.content)
            source = source.replace(":click-correct:", "<span data-correct>")
            source = source.replace(":click-incorrect:", "<span data-incorrect>")
            source = source.replace(":endclick:", "</span>")
            source = "<pre>" + source + "</pre>"
            self.options['clickcode'] = source
        else:
            self.options['clickcode'] = ''
        clickNode = ClickableAreaNode(self.options)
        clickNode.template_start = TEMPLATE

        if "table" in self.options:
            self.options["table"] = "data-table"
        else:
            self.options["table"] = ""

        if "iscode" not in self.options:
            self.state.nested_parse(self.content, self.content_offset, clickNode)

        return [clickNode]
