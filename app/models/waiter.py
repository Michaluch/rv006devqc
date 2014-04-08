from models.utilities import Utilit
from models.wrapper import Wrapper


class Waiter(object):
    """waiter"""

    def __init__(self):
        self.wrap = Wrapper()

    def add_order(self, waiter_id, order_data):
        """must put waiter id and tickets in list of dict
        [{"id_dish": 1, "count": 1},{"id_dish": 12, "count": 1}..."""
        order = {"status": 1,
               "id_user": waiter_id,
               "date": "CURRENT_DATE()"
               #here must be data
                }
        order_id = self.wrap.insert(order, "orders")
        for ticket in order_data:
            ticket["id_order"] = order_id
            self.wrap.insert(ticket, "tickets")

    def get_orders(self, waiter_id):
        """return dict with status and order id
        {'status': 1, 'id': 12L}"""
        orders = self.wrap.select("status, id", "orders",
                                  "WHERE orders.status=1 \
                                   AND orders.id_user={0}".format(waiter_id))
        return orders

    def del_order(self, order_id):
        """get order id. Set status to NULL"""
        self.wrap.update({"status": 0}, "orders",
                          "WHERE id={0}".format(order_id))
##############################################################################

    def get_order(self, order_id):
        tickets = self.wrap.select("*", "tickets",
                          "WHERE tickets.id_order={0}").format(order_id)
        return tickets

    def edit_order(self, order_data):
        """get order data with order id
        [{"id_dish": 1, "count": 1,"id_order": 315},...
        for ticket in order_data:
            self.wrap.insert(ticket, "tickets")"""
            pass

    def del_ticket(self):
        pass


if __name__ == "__main__":
    w = Waiter()
    order = [{"id_dish": 1, "count": 1}, #ticket 1
            {"id_dish": 12, "count": 1}, #ticket 2
            {"id_dish": 11, "count": 1}, #ticket 3
            {"id_dish": 5, "count": 1},  #ticket 4
            {"id_dish": 7, "count": 1}   #ticket 5
            ]
    w.add_order(1, order)
    print w.get_orders(1)
