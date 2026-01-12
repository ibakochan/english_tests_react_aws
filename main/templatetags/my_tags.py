from django import template

register = template.Library()


@register.filter(name='remove_letters_from_end')
def remove_letters_from_end(value, num_letters_str):
    """
    Removes the specified number of letters from the end of the value.
    """
    num_letters = len(str(num_letters_str))
    return value[:-num_letters]

@register.filter(name='remove_numbers_from_end')
def remove_numbers_from_end(value, num_letters):
    """
    Removes the specified number of letters from the end of the value.
    """
    try:
        value_str = str(value)  
        num_letters = int(num_letters)
        return value_str[:-num_letters]
    except (ValueError, TypeError):
         
        return value