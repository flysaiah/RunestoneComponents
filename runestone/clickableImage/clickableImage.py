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
    app.add_directive('clickableimage',ClickableImage)
    app.add_javascript('clickableImage.js')
    #app.add_javascript('timedclickableimage.js')
    app.add_stylesheet('clickable.css')

    app.add_node(ClickableImageNode, html=(visit_ci_node, depart_ci_node))


TEMPLATE = """
<div data-component="clickableimage" id="%(divid)s">
<span data-question>%(question)s</span>%(feedback)s
<img data-source src=%(source)s/>

"""
TEMPLATE_END = """
</div>
"""

class ClickableImageNode(nodes.General, nodes.Element):
    def __init__(self,content):
        """
        Arguments:
        - `self`:
        - `content`:
        """
        super(ClickableImageNode,self).__init__()
        self.ci_options = content

# self for these functions is an instance of the writer class.  For example
# in html, self is sphinx.writers.html.SmartyPantsHTMLTranslator
# The node that is passed as a parameter is an instance of our node class.
def visit_ci_node(self,node):
    res = TEMPLATE

    if "feedback" in node.ci_options:
        node.ci_options["feedback"] = "<span data-feedback>" + node.ci_options["feedback"] + "</span>"
    else:
        node.ci_options["feedback"] = ""

    res = res % node.ci_options

    self.body.append(res)

def depart_ci_node(self,node):
    res = ""
    res = TEMPLATE_END % node.ci_options
    self.body.append(res)


class ClickableImage(Directive):
    required_arguments = 1
    optional_arguments = 0
    has_content = True
    final_argument_whitespace = True
    option_spec = {"feedback":directives.unchanged,
        "image":directives.unchanged,
        "correct":directives.unchanged,
        "incorrect":directives.unchanged,
    }

    def run(self):
        """
            process the clickableimage directive and generate html for output.
            :param self:
            :return:
            .. clickableimage:: identifier
                :feedback: Optional feedback for incorrect answer
                :image: URL for image whose regions will be clickable
                :correct: Specifies regions that should be clicked for a correct answer
                :incorrect: Specifies regions that should not be clicked for a correct answer. Formatting/Examples of "regions" are:
                ("rect", "x position, y position, width, height"), ("circle", "x position of center, y position of center")
                ("polygon", "x_coord1,y_coord1 x_coord2,y_coord2 x_coord3,y_coord3 ...etc..."), ("rect", "0,50,150,100")

                --Question text--
        """
        self.options['divid'] = self.arguments[0]

        if self.content:
            source = "\n".join(self.content)
        else:
            source = '\n'
        self.options['question'] = source

        clickNode = ClickableImageNode(self.options)
        clickNode.template_start = TEMPLATE

        #TODO: implement this like dragndrop.py, where we have node.template_options and iteration

        return [clickNode]
