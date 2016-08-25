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
    app.add_stylesheet('clickableImage.css')

    app.add_node(ClickableImageNode, html=(visit_ci_node, depart_ci_node))


TEMPLATE_START = """
<div data-component="clickableimage" id="%(divid)s">
<span data-question>%(question)s</span>
<span data-feedback>%(feedback)s</span>
<img data-source data-height="%(height)s" data-width="%(width)s" src="%(image)s"/>
<svg data-clickareas>
"""

#
# """
#         <span data-question>Click on the correct sections of this image.</span>
#         <span data-feedback>Sorry, try again!</span>
#         <img data-source data-height="300" data-width="300" src="image.jpg"/>
#         <svg data-clickareas>
#             <rect data-incorrect x="0" y="0" width="150" height="150"></rect>
#             <rect data-correct x="150" y="0" width="150" height="150"></rect>
#             <rect data-incorrect x="150" y="150" width="150" height="150"></rect>
#             <rect data-correct x="0" y="150" width="150" height="150"></rect>
#         </svg>
#
# """
TEMPLATE_OPTION = """<%(type)s %(correct)s %(coordinates)s></%(type)s>
"""

TEMPLATE_END = """
</svg>
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
    res = TEMPLATE_START

    if "feedback" in node.ci_options:
        node.ci_options["feedback"] = "<span data-feedback>" + node.ci_options["feedback"] + "</span>"
    else:
        node.ci_options["feedback"] = ""

    res = res % node.ci_options

    self.body.append(res)

def depart_ci_node(self,node):
    res = ""
    # Add all of the possible answers

    correctStrings = node.ci_options['correct'].split(';')
    incorrectStrings = node.ci_options['incorrect'].split(';')

    allStrings = correctStrings + [-1] + incorrectStrings
    correctValue = "data-correct"

    for string in allStrings:
        if string == -1:
            correctValue = "data-incorrect"
            continue
        answerType = string.split(",")[0].strip(" (,'\"")
        node.ci_options["type"] = answerType
        if answerType == "rect":
            tmpCoords = string.split(",")[1:]

            node.ci_options["coordinates"] = "x=\"" + tmpCoords[0].strip(" )',\"") + "\" y=\"" + tmpCoords[1].strip(" )',\"") + "\" width=\"" \
            + tmpCoords[2].strip(" )',\"") + "\" height=\"" + tmpCoords[3].strip(" )',\"") + "\""
        # TODO: Cover other 2 cases here
        node.ci_options["correct"] = correctValue
        res += node.template_option % node.ci_options


    print("-------------HERE------------")
    print('')
    print(res)
    print('')

    okeys = list(node.ci_options.keys())
    okeys.sort()
    for k in okeys:
        if 'match' in k:
            x,label = k.split('_')
            node.ci_options['ci_label'] = label
            dragE, dropE = node.ci_options[k].split("|||")
            node.ci_options["dragText"] = dragE
            node.ci_options['dropText'] = dropE
            res += node.template_option % node.ci_options
    res += node.template_end % node.ci_options
    self.body.append(res)


class ClickableImage(Directive):
    required_arguments = 1
    optional_arguments = 0
    has_content = True
    final_argument_whitespace = True
    option_spec = {"feedback":directives.unchanged,
        "image":directives.unchanged,
        "height":directives.unchanged,
        "width":directives.unchanged,
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
                :height: Desired height of the image (in pixels)
                :width: Desired width of the image (in pixels)
                :correct: Specifies regions that should be clicked for a correct answer, separated by semicolons
                :incorrect: Specifies regions that should not be clicked for a correct answer, separated by semicolons. Correct formatting of "regions" includes:
                ("rect", "x position, y position, width, height"); ("circle", "x position of center, y position of center, radius size");
                ("polygon", "x_coord1,y_coord1 : x_coord2,y_coord2 : x_coord3,y_coord3 : ...etc...")  EXAMPLE: ("rect", "0,50,150,100")

                --Question text--
        """
        self.options['divid'] = self.arguments[0]

        if self.content:
            source = "\n".join(self.content)
        else:
            source = '\n'
        self.options['question'] = source

        clickNode = ClickableImageNode(self.options)
        clickNode.template_start = TEMPLATE_START
        clickNode.template_option = TEMPLATE_OPTION
        clickNode.template_end = TEMPLATE_END

        return [clickNode]
